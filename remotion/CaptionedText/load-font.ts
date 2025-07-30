import { continueRender, delayRender } from "remotion";

export const TheBoldFont = `TheBoldFont`;

let loaded = false;

export const loadFont = async (): Promise<void> => {
  if (loaded) {
    return Promise.resolve();
  }

  const waitForFont = delayRender();

  loaded = true;

  const font = new FontFace(
    TheBoldFont,
    `url('https://kdmeditor.s3.us-east-1.amazonaws.com/kd_videoeditor/fontfamily/theboldfont.ttf') format('truetype')`,
  );

  await font.load();
  document.fonts.add(font);

  continueRender(waitForFont);
};
