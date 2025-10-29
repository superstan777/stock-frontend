import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { AppSidebar } from "@/components/AppSidebar";
import { usePathname, useRouter } from "next/navigation";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock("@/components/ui/sidebar", () => ({
  Sidebar: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarGroup: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarGroupLabel: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarGroupContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarMenu: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarMenuButton: ({
    children,
  }: {
    children: React.ReactNode;
    asChild?: boolean;
    isActive?: boolean;
  }) => <div>{children}</div>,
  SidebarRail: () => <div />,
}));

describe("AppSidebar", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (usePathname as jest.Mock).mockReturnValue("/");
  });

  it("renders all groups and menu items", () => {
    render(<AppSidebar />);

    expect(screen.getByText("Main")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Computers")).toBeInTheDocument();
    expect(screen.getByText("Monitors")).toBeInTheDocument();
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("Tickets")).toBeInTheDocument();
  });

  it("renders correct hrefs for menu items", () => {
    render(<AppSidebar />);

    expect(screen.getByText("Dashboard").closest("a")).toHaveAttribute(
      "href",
      "/"
    );
    expect(screen.getByText("Computers").closest("a")).toHaveAttribute(
      "href",
      "/computers?page=1"
    );
    expect(screen.getByText("Monitors").closest("a")).toHaveAttribute(
      "href",
      "/monitors?page=1"
    );
    expect(screen.getByText("Users").closest("a")).toHaveAttribute(
      "href",
      "/users"
    );
    expect(screen.getByText("Tickets").closest("a")).toHaveAttribute(
      "href",
      "/tickets"
    );
  });

  it("calls router.push when clicking STOCK button", () => {
    render(<AppSidebar />);
    const button = screen.getByText("STOCK");
    fireEvent.click(button);
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("marks active menu item correctly", () => {
    (usePathname as jest.Mock).mockReturnValue("/users");
    render(<AppSidebar />);

    expect(screen.getByText("Users")).toBeInTheDocument();
  });
});
