import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import AdminPostPreview from "@/components/AdminPostPreview";

beforeEach(() => {
  sessionStorage.clear();
  global.fetch = jest.fn((url) => {
    if (url.includes("/api/posts/123"))
      return Promise.resolve(
        new Response(
          JSON.stringify({
            _id: "123",
            title: "Single",
            content: "<p>content</p>",
            createdAt: new Date().toISOString(),
          }),
          { status: 200 },
        ),
      );
    return Promise.resolve(new Response("{}", { status: 404 }));
  });
});

test("renders single post via admin token", async () => {
  render(<AdminPostPreview id={"123"} />);

  expect(screen.getByText(/Loading post preview/i)).toBeInTheDocument();

  await waitFor(() => expect(screen.getByText("Single")).toBeInTheDocument());
});
