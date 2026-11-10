import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { Button } from "@/components";

describe("Button", () => {
  it("shows its title and calls onPress", () => {
    const onPress = jest.fn();
    render(<Button title="Pay now" onPress={onPress} />);
    fireEvent.press(screen.getByRole("button", { name: "Pay now" }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not call onPress when disabled", () => {
    const onPress = jest.fn();
    render(<Button title="Pay now" onPress={onPress} disabled />);
    fireEvent.press(screen.getByRole("button", { name: "Pay now" }));
    expect(onPress).not.toHaveBeenCalled();
  });
});
