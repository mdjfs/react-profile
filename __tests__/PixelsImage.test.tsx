import React from "react";
import { render } from '@testing-library/react';
import { PixelsImage } from "../src"

describe('PixelsImage', () => {

  it('just render', async () => {
    const element = render(<PixelsImage placeholder="Test Image"/>)
    expect(element.getByPlaceholderText("Test Image")).toBeDefined()
  })

});