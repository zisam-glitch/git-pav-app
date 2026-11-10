import React from "react";
import { render, screen } from "@testing-library/react-native";
import { Input } from "@/components";

describe("Input accessibility name", () => {
  it("uses the visible label", () => {
    render(<Input label="Email" placeholder="you@example.test" value="" onChangeText={() => {}} />);
    expect(screen.getByLabelText("Email")).toBeTruthy();
  });

  it("falls back to the placeholder when the label is empty", () => {
    render(<Input label="" placeholder="Search messages" value="" onChangeText={() => {}} />);
    expect(screen.getByLabelText("Search messages")).toBeTruthy();
  });

  it("lets the caller name the field explicitly", () => {
    render(<Input label="" placeholder="Write a reply…" accessibilityLabel="Your reply" value="" onChangeText={() => {}} />);
    expect(screen.getByLabelText("Your reply")).toBeTruthy();
  });
});
