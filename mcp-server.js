#!/usr/bin/env node

/**
 * Person CRUD MCP Server
 * 
 * This is the actual MCP server that Claude Desktop connects to.
 * It exposes tools for creating, reading, updating, and deleting Person records.
 * 
 * The server communicates over stdio with Claude Desktop.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import axios from "axios";
import * as z from "zod";

// Configuration
const API_BASE_URL = process.env.PERSON_APP_URL || "http://localhost:3000/api";

// Create MCP Server instance
const mcpServer = new McpServer({
  name: "person-crud-server",
  version: "1.0.0",
});

// Define and register tools
mcpServer.registerTool("create_person", {
  description: "Create a new person record with their information",
  inputSchema: {
    name: z.string().describe("Full name of the person"),
    age: z.number().describe("Age of the person"),
    email: z.string().describe("Email address (must be unique)"),
    phone: z.string().optional().describe("Phone number"),
    position: z.string().optional().describe("Job position"),
    department: z.string().optional().describe("Department name"),
    bio: z.string().optional().describe("Biography"),
  },
}, async ({ name, age, email, phone, position, department, bio }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/people`, {
      name,
      age: parseInt(age),
      email,
      phone: phone || null,
      position: position || null,
      department: department || null,
      bio: bio || null,
    });

    return {
      content: [
        {
          type: "text",
          text: `✅ Person created successfully:\n${JSON.stringify(response.data, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.message || "Unknown error";
    return {
      content: [
        {
          type: "text",
          text: `❌ Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

mcpServer.registerTool("read_people", {
  description: "Get a list of all people in the database or details about a specific person",
  inputSchema: {
    id: z.string().optional().describe("Optional person ID. If provided, returns only that person"),
  },
}, async ({ id }) => {
  try {
    if (id) {
      const response = await axios.get(`${API_BASE_URL}/people/${id}`);
      return {
        content: [
          {
            type: "text",
            text: `📋 Person found:\n${JSON.stringify(response.data, null, 2)}`,
          },
        ],
      };
    } else {
      const response = await axios.get(`${API_BASE_URL}/people`);
      return {
        content: [
          {
            type: "text",
            text: `📋 All people (${response.data.length} total):\n${JSON.stringify(response.data, null, 2)}`,
          },
        ],
      };
    }
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.message || "Unknown error";
    return {
      content: [
        {
          type: "text",
          text: `❌ Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

mcpServer.registerTool("update_person", {
  description: "Update a person's information",
  inputSchema: {
    id: z.string().describe("Person ID"),
    name: z.string().optional().describe("Updated name"),
    age: z.number().optional().describe("Updated age"),
    email: z.string().optional().describe("Updated email"),
    phone: z.string().optional().describe("Updated phone"),
    position: z.string().optional().describe("Updated position"),
    department: z.string().optional().describe("Updated department"),
    bio: z.string().optional().describe("Updated bio"),
  },
}, async ({ id, name, age, email, phone, position, department, bio }) => {
  try {
    const updateData = {};
    if (name) updateData.name = name;
    if (age) updateData.age = parseInt(age);
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (position) updateData.position = position;
    if (department) updateData.department = department;
    if (bio) updateData.bio = bio;

    const response = await axios.put(`${API_BASE_URL}/people/${id}`, updateData);
    return {
      content: [
        {
          type: "text",
          text: `✅ Person updated successfully:\n${JSON.stringify(response.data, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.message || "Unknown error";
    return {
      content: [
        {
          type: "text",
          text: `❌ Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

mcpServer.registerTool("delete_person", {
  description: "Delete a person record from the database",
  inputSchema: {
    id: z.string().describe("Person ID to delete"),
  },
}, async ({ id }) => {
  try {
    await axios.delete(`${API_BASE_URL}/people/${id}`);
    return {
      content: [
        {
          type: "text",
          text: `✅ Person with ID ${id} deleted successfully`,
        },
      ],
    };
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.message || "Unknown error";
    return {
      content: [
        {
          type: "text",
          text: `❌ Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

mcpServer.registerTool("get_server_status", {
  description: "Check the status and configuration of the MCP server",
  inputSchema: {},
}, async () => {
  return {
    content: [
      {
        type: "text",
        text: `✅ MCP Server Status:\n- Server: person-crud-server v1.0.0\n- API Base URL: ${API_BASE_URL}\n- Status: Connected and ready\n- Available tools: create_person, read_people, update_person, delete_person, get_server_status`,
      },
    ],
  };
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);
  console.error("Person CRUD MCP Server started successfully");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
