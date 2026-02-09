import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import AdminBlogPreview from "@/components/AdminBlogPreview";

beforeEach(() => {
  sessionStorage.clear();
  global.fetch = jest.fn((url) => {
    if (url.endsWith("/api/settings"))
      return Promise.resolve(
        new Response(JSON.stringify({ showBlog: true }), { status: 200 }),
      );
    if (url.endsWith("/api/posts"))
      return Promise.resolve(
        new Response(
          JSON.stringify([
            {
              _id: "1",
              title: "Hello",
              createdAt: new Date().toISOString(),
              excerpt: "x",
            },
          ]),
          { status: 200 },
        ),
      );
    return Promise.resolve(new Response("{}", { status: 404 }));
  });
});

test("renders posts fetched via admin headers", async () => {
  render(<AdminBlogPreview />);

  expect(screen.getByText(/Loading admin preview/i)).toBeInTheDocument();

  await waitFor(() => expect(screen.getByText("Hello")).toBeInTheDocument());
});
