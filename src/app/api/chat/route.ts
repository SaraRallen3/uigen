import type { FileNode } from "@/lib/file-system";
import { VirtualFileSystem } from "@/lib/file-system";
import { streamText, appendResponseMessages, createDataStreamResponse } from "ai";
import { buildStrReplaceTool } from "@/lib/tools/str-replace";
import { buildFileManagerTool } from "@/lib/tools/file-manager";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getLanguageModel } from "@/lib/provider";
import { generationPrompt } from "@/lib/prompts/generation";

export async function POST(req: Request) {
  let body: {
    messages: any[];
    files: Record<string, FileNode>;
    projectId?: string;
  };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const { messages, files, projectId } = body;
  if (!Array.isArray(messages)) {
    return new Response("`messages` must be an array", { status: 400 });
  }

  // If a projectId is provided, authenticate and verify ownership *before*
  // running the (paid) generation, so unauthorized callers can't trigger it.
  let session = null;
  // Captured at request start; used as an optimistic-concurrency token so a
  // concurrent save to the same project doesn't get silently clobbered.
  let expectedUpdatedAt: Date | null = null;
  if (projectId) {
    session = await getSession();
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: session.userId },
      select: { id: true, updatedAt: true },
    });
    if (!project) {
      return new Response("Project not found", { status: 404 });
    }
    expectedUpdatedAt = project.updatedAt;
  }

  // Build the model-facing message list without mutating the caller's array.
  const modelMessages = [
    {
      role: "system",
      content: generationPrompt,
      providerOptions: {
        anthropic: { cacheControl: { type: "ephemeral" } },
      },
    },
    ...messages,
  ];

  // Reconstruct the VirtualFileSystem from serialized data
  const fileSystem = new VirtualFileSystem();
  fileSystem.deserializeFromNodes(files);

  const model = getLanguageModel();
  // Use fewer steps for mock provider to prevent repetition
  const isMockProvider = !process.env.ANTHROPIC_API_KEY;

  return createDataStreamResponse({
    execute: (dataStream) => {
      const result = streamText({
        model,
        messages: modelMessages,
        maxTokens: 10_000,
        maxSteps: isMockProvider ? 4 : 40,
        abortSignal: req.signal,
        onError: (err: any) => {
          console.error(err);
        },
        tools: {
          str_replace_editor: buildStrReplaceTool(fileSystem),
          file_manager: buildFileManagerTool(fileSystem),
        },
        onFinish: async ({ response }) => {
          // Save to project. Auth + ownership were already verified above, so a
          // non-null session and an owned projectId are guaranteed here.
          if (projectId && session) {
            try {
              // Get the messages from the response
              const responseMessages = response.messages || [];
              // Combine original messages (system prompt was never added to
              // these) with response messages
              const allMessages = appendResponseMessages({
                messages: [...messages],
                responseMessages,
              });

              // Optimistic-concurrency guard: only write if no other request
              // has touched this project since we read it (updatedAt unchanged).
              const { count } = await prisma.project.updateMany({
                where: {
                  id: projectId,
                  userId: session.userId,
                  updatedAt: expectedUpdatedAt ?? undefined,
                },
                data: {
                  messages: JSON.stringify(allMessages),
                  data: JSON.stringify(fileSystem.serialize()),
                },
              });

              if (count === 0) {
                // A concurrent request modified the project first — don't
                // clobber its work; let the client know this run wasn't saved.
                console.error(
                  "Stale write: project changed concurrently, save skipped"
                );
                dataStream.writeData({
                  type: "save-status",
                  status: "error",
                  reason: "conflict",
                });
              }
            } catch (error) {
              console.error("Failed to save project data:", error);
              dataStream.writeData({
                type: "save-status",
                status: "error",
                reason: "exception",
              });
            }
          }
        },
      });

      result.mergeIntoDataStream(dataStream);
    },
    onError: (err) => {
      console.error(err);
      return "An error occurred while generating the response.";
    },
  });
}

export const maxDuration = 120;
