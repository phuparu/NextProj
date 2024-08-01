import Prompt from "@models/prompt";
import { connectToDB } from "@utils/database";
import { ObjectId } from "mongodb";

// GET (read)
export const GET = async (request, { params }) => {
  try {
    await connectToDB();

    const prompt = await Prompt.findById(params.id).populate("creator");

    if (!prompt) {
      return new Response("Prompt not found", { status: 404 });
    }

    return new Response(JSON.stringify(prompt), { status: 200 });
  } catch (err) {
    console.error("Error fetching prompt:", err);
    return new Response("Error fetching prompt", { status: 500 });
  }
};

// PATCH (update)
export const PATCH = async (request, { params }) => {
  const { prompt, tag } = await request.json();

  try {
    await connectToDB();

    const existingPrompt = await Prompt.findById(params.id);

    if (!existingPrompt) {
      return new Response("Prompt not found", { status: 404 });
    }

    //update prompt
    existingPrompt.prompt = prompt;
    existingPrompt.tag = tag;

    await existingPrompt.save();

    return new Response(JSON.stringify(existingPrompt), { status: 200 });
  } catch (err) {
    console.error("Failed to update prompt:", err);
    return new Response("Failed to update prompt", { status: 500 });
  }
};

// DELETE (delete)
export const DELETE = async (request, { params }) => {
  try {
    await connectToDB();

    // Validate the ID
    if (!ObjectId.isValid(params.id)) {
      return new Response("Invalid ID format", { status: 400 });
    }

    // Find the prompt by ID and remove it
    const deletedPrompt = await Prompt.findByIdAndDelete(params.id);

    if (!deletedPrompt) {
      return new Response("Prompt not found", { status: 404 });
    }

    return new Response("Prompt deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Error deleting prompt:", error.message); // Enhanced error logging
    console.error("Stack trace:", error.stack); // Log stack trace
    return new Response(`Error deleting prompt: ${error.message}`, {
      status: 500,
    });
  }
};
