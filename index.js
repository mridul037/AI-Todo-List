const express = require('express');
const Together = require('together-ai');
const { tool } = require('ai');
const { z } = require('zod');

const app = express();
const port = 3000;

// API key for Together
const together = new Together({
  apiKey: "674b66450375c9c7e65fdf3c3fe23a18b6898662ea4a92c56e4ca5c470178588",
});

app.use(express.json());

const todoToolSchema = z.object({
  type: z.enum(["add", "mark-done", "update"]),
  content: z.string(),
  id: z.string().optional(),
});

const tools = {
  todo: tool({
    description:
      "Interact with todo list. If the user says they've done something or say they need to do something, use this tool to either add a todo or mark a todo as done.",
    parameters: todoToolSchema,
  }),
};

// Array to store todos
let todos = [
];

// Endpoint to fetch todos and add a new one
app.post('/api/add-todo', async (req, res) => {
  const { content } = req.body;

  // Add todo to the list

  

  // Optionally, you can call Together API to get a response (like some feedback)
  const updatedMessages = `I added a new todo: ${content}`;
  let mess=[{
    role: "system",
    content: "You are a helpful assistant. Do not include a summary of todos in your responses.",
  },
  {
    role: "user",
    content: "below is new added todo item can you give in one line item needed to be added to todo list.",
  },
  { role: "user", content: updatedMessages }];


  const stream = await together.chat.completions.create({
    model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
    messages: mess,
    stream: true,
  });

  let response = "";
  for await (const chunk of stream) {
    response += chunk.choices[0]?.delta?.content || "";
  }
  const newTodo = { id: `${todos.length + 1}`, content:response, done: false };
  todos.push(newTodo);
  // Respond with the updated todo list
  res.json({ todos, response });
});

// Serve static HTML files
app.use(express.static('public'));

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
