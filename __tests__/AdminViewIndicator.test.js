import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import AdminViewIndicator from "@/components/AdminViewIndicator";

beforeEach(() => {
  sessionStorage.clear();
  global.fetch = jest.fn((url) => {
    if (url.endsWith("/api/posts"))
      return Promise.resolve(new Response(JSON.stringify([]), { status: 200 }));
    return Promise.resolve(new Response("{}", { status: 200 }));
  });
});

test("shows banner when admin_view exists and server validates session", async () => {
  sessionStorage.setItem(
    "admin_view",
    JSON.stringify({ path: "/blog", ts: Date.now() }),
  );

  render(<AdminViewIndicator />);

  // optimistic show should render immediately
  expect(screen.getByText(/Admin preview enabled/i)).toBeInTheDocument();

  // wait for fetch validation to complete
  await waitFor(() => expect(global.fetch).toHaveBeenCalled());
});
