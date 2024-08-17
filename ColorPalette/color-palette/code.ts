figma.showUI(__html__);

/*
 TESTING COLORS
 #AFD0BF - primary
 #808F87 - secondary
 #7785AC - background
 */

figma.ui.onmessage = (msg: { type: string; colorArray: Array<Array<string>>; count: number }) => {
  // Function that multiply by factor rgb values and make that way the different color variant
  const adjustColor = (rgb: { r: number; g: number; b: number }, factor: number) => {
    return {
      r: Math.min(Math.max(0, rgb.r * factor), 1),
      g: Math.min(Math.max(0, rgb.g * factor), 1),
      b: Math.min(Math.max(0, rgb.b * factor), 1),
    };
  };

  // Function that generates color variants
  const generateColorVariants = (
    rgb: { r: number; g: number; b: number },
    hoverFactor: number = 1.2,
    clickFactor: number = 0.8
  ) => {
    const baseColor = rgb;
    const hoverColor = adjustColor(baseColor, hoverFactor);
    const clickColor = adjustColor(baseColor, clickFactor);

    return {
      baseColor,
      hoverColor,
      clickColor,
    };
  };

  // Function that converts hex to rgba
  const hexToRgba = (hex: string, alpha: number = 1) => {
    // Remove the hash at the start if it's there
    hex = hex.replace(/^#/, "");

    // Parse 3-digit hex codes
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((x) => x + x)
        .join("");
    }

    // Convert to integer values
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    // Create array of color values
    const rgbaArray = [];
    rgbaArray.push(r);
    rgbaArray.push(g);
    rgbaArray.push(b);
    rgbaArray.push(alpha);

    return rgbaArray;

    //Return the rgba as a string
    // return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Function that creates colors in circles
  const createColorsInCircles = (colorArray: Array<Array<string>>, countOfColors: number) => {
    const nodes: SceneNode[] = [];
    const verticalSpacing = 150;
    const horizontalSpacing = 150;

    for (let i = 0; i < countOfColors; i++) {
      // Create text
      let text = figma.createText();

      // Set a specific font before loading it
      let font = { family: "Open Sans", style: "Regular" };

      (async () => {
        // Move to positions
        text.x = i * horizontalSpacing;
        text.y = i * verticalSpacing - 50;

        // Load the font in the text node before setting the characters
        await figma.loadFontAsync(font);
      })().then(() => {
        text.fontName = font;
        text.characters = `COLOR NAME = ${colorArray[i][0].toUpperCase()}`;

        // Set font size and color
        text.fontSize = 18;
        text.fills = [{ type: "SOLID", color: { r: 5, g: 0, b: 18 } }];

        // Append the text to the page
        figma.currentPage.appendChild(text);
        nodes.push(text);
      });

      // Create new ellipse
      const ellipseWithColorBase = figma.createEllipse();
      const ellipseWithColorHover = figma.createEllipse();
      const ellipseWithColorClicked = figma.createEllipse();

      // Set horizontal position for each column
      const xPosition = i * horizontalSpacing;

      // Set vertical positions for each ellipse
      ellipseWithColorBase.x = xPosition;
      ellipseWithColorHover.x = xPosition;
      ellipseWithColorClicked.x = xPosition;

      ellipseWithColorBase.y = 0 * verticalSpacing;
      ellipseWithColorHover.y = 1 * verticalSpacing;
      ellipseWithColorClicked.y = 2 * verticalSpacing;

      /* 
      // Set color using figma.util.solidPaint with hex color from colorArray
      const hexColor = colorArray[i][1]; // Assuming first element of each inner array is the hex color
      ellipseWithColor.fills = [figma.util.solidPaint(hexColor)];
      */

      // Convert hex to rgba
      let rgbaInArray = hexToRgba(colorArray[i][1]);

      // Example base color
      const rgbColor = { r: rgbaInArray[0], g: rgbaInArray[1], b: rgbaInArray[2] };

      // Generate color variants
      const colorVariants = generateColorVariants(rgbColor);

      // Set color in rgb
      // ellipseWithColorBase.fills = [
      //   { type: "SOLID", color: { r: rgbaInArray[0], g: rgbaInArray[1], b: rgbaInArray[2] } },
      // ];

      // Set color in rgb
      ellipseWithColorBase.fills = [
        {
          type: "SOLID",
          color: { r: colorVariants.baseColor.r, g: colorVariants.baseColor.g, b: colorVariants.baseColor.b },
        },
      ];
      // Set color in rgb
      ellipseWithColorHover.fills = [
        {
          type: "SOLID",
          color: { r: colorVariants.hoverColor.r, g: colorVariants.hoverColor.g, b: colorVariants.hoverColor.b },
        },
      ];
      // Set color in rgb
      ellipseWithColorClicked.fills = [
        {
          type: "SOLID",
          color: { r: colorVariants.clickColor.r, g: colorVariants.clickColor.g, b: colorVariants.clickColor.b },
        },
      ];

      // Set name
      ellipseWithColorBase.name = `${colorArray[i][0]} -- base`;
      ellipseWithColorHover.name = `${colorArray[i][0]} -- hover`;
      ellipseWithColorClicked.name = `${colorArray[i][0]} -- clicked`;

      // Appending
      figma.currentPage.appendChild(ellipseWithColorBase);
      figma.currentPage.appendChild(ellipseWithColorHover);
      figma.currentPage.appendChild(ellipseWithColorClicked);

      // Push nodes
      nodes.push(ellipseWithColorBase);
      nodes.push(ellipseWithColorHover);
      nodes.push(ellipseWithColorClicked);
    }

    figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);
  };

  // Call "createColorInCircles" only if message equals "create-color-palette"
  if (msg.type === "create-color-palette") {
    createColorsInCircles(msg.colorArray, msg.count);
  }

  figma.closePlugin();
};

// ctrl + shift + B then select watch ts config.json <--- Builds changes
