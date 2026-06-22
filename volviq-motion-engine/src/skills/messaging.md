---
title: Chat & Messaging UI
impact: HIGH
impactDescription: creates realistic chat interfaces with proper bubble styling and animations
tags: chat, messaging, whatsapp, imessage, bubbles, conversation
---

## Chat Bubble Layout

Use flexbox to align sent messages right, received messages left.

**Incorrect (all bubbles centered):**

```tsx
<div style={{ textAlign: "center" }}>
  {messages.map((msg) => (
    <div>{msg.text}</div>
  ))}
</div>
```

**Correct (proper chat alignment):**

```tsx
<div
  style={{
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    padding: 40,
  }}
>
  {messages.map((msg, i) => (
    <div
      style={{
        display: "flex",
        justifyContent: msg.sent ? "flex-end" : "flex-start",
        marginTop: 12,
      }}
    >
      <div
        style={{
          maxWidth: "70%",
          padding: "12px 16px",
          borderRadius: 16,
          backgroundColor: msg.sent ? "#1f8a70" : "#202c33",
          color: "#e9edef",
        }}
      >
        {msg.text}
      </div>
    </div>
  ))}
</div>
```

## Staggered Message Entrances

Messages should appear one by one with slide + fade animations.

**Incorrect (all messages appear at once):**

```tsx
{
  messages.map((msg) => <Bubble text={msg.text} />);
}
```

**Correct (staggered with delays):**

```tsx
const STAGGER_DELAY = 38;
const FADE_DURATION = 18;

{
  messages.map((msg, i) => {
    const startFrame = i * STAGGER_DELAY;
    const opacity = interpolate(
      frame - startFrame,
      [0, FADE_DURATION],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
    const slideX = interpolate(opacity, [0, 1], [msg.sent ? 40 : -40, 0]);

    return (
      <div style={{ opacity, transform: `translateX(${slideX}px)` }}>
        {msg.text}
      </div>
    );
  });
}
```

## Spring Bounce on Bubble Entrance

Add spring physics for organic bubble pop-in effect.

```tsx
const bounce = spring({
  frame: frame - startFrame,
  fps,
  config: { damping: 12, stiffness: 170 }
});
const scaleValue = interpolate(bounce, [0, 1], [0.98, 1]);

<div style={{
  transform: `translateX(${slideX}px) scale(${scaleValue})`,
  transformOrigin: msg.sent ? "100% 100%" : "0% 100%"
}}>
```

## Typing Indicator Animation ("..." dots)

Show animated typing dots before a message appears.

```tsx
const TYPING_START = messageStartFrame - 25;
const TYPING_DURATION = 20;

const typingVisible = frame >= TYPING_START && frame < messageStartFrame;
const dot1 = Math.sin((frame - TYPING_START) * 0.3) * 4;
const dot2 = Math.sin((frame - TYPING_START) * 0.3 + 1) * 4;
const dot3 = Math.sin((frame - TYPING_START) * 0.3 + 2) * 4;

{typingVisible && (
  <div
    style={{
      display: "flex",
      justifyContent: "flex-start",
      marginTop: 12,
    }}
  >
    <div
      style={{
        backgroundColor: "#202c33",
        borderRadius: 16,
        padding: "14px 18px",
        display: "flex",
        gap: 5,
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: "#8696a0",
          transform: `translateY(${dot1}px)`,
        }}
      />
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: "#8696a0",
          transform: `translateY(${dot2}px)`,
        }}
      />
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: "#8696a0",
          transform: `translateY(${dot3}px)`,
        }}
      />
    </div>
  </div>
)}
```

## Read Receipt Animation (Double Checkmark)

Show delivery → read status after sent message.

```tsx
const CHECK_DELAY = startFrame + 15;
const READ_DELAY = CHECK_DELAY + 20;

const checkOpacity = interpolate(frame - CHECK_DELAY, [0, 5], [0, 1], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});
const isRead = frame >= READ_DELAY;
const checkColor = isRead ? "#53bdeb" : "#8696a0";

{msg.sent && (
  <span style={{ fontSize: 12, color: checkColor, opacity: checkOpacity, marginLeft: 6 }}>
    ✓✓
  </span>
)}
```

## Reaction Emoji Popup

Emoji reaction pops up on a message with bounce.

```tsx
const REACTION_DELAY = messageStartFrame + 30;
const reactionBounce = spring({
  frame: frame - REACTION_DELAY,
  fps,
  config: { damping: 8, stiffness: 200 },
});

{frame >= REACTION_DELAY && (
  <div
    style={{
      position: "absolute",
      bottom: -12,
      right: msg.sent ? 12 : undefined,
      left: msg.sent ? undefined : 12,
      transform: `scale(${reactionBounce})`,
      fontSize: 18,
      background: "rgba(32, 44, 51, 0.9)",
      borderRadius: 20,
      padding: "3px 8px",
      border: "1px solid rgba(255,255,255,0.1)",
    }}
  >
    ❤️
  </div>
)}
```

## Premium Frosted Background

```tsx
<AbsoluteFill
  style={{
    background: "radial-gradient(ellipse at 50% 50%, #1a2332 0%, #0b141a 100%)",
  }}
>
  {/* Optional blurred decorative shapes behind chat */}
  <div
    style={{
      position: "absolute",
      width: 300,
      height: 300,
      borderRadius: "50%",
      background: "rgba(31, 138, 112, 0.08)",
      filter: "blur(60px)",
      top: "20%",
      left: "10%",
    }}
  />
  <div
    style={{
      position: "absolute",
      width: 200,
      height: 200,
      borderRadius: "50%",
      background: "rgba(83, 189, 235, 0.06)",
      filter: "blur(50px)",
      bottom: "30%",
      right: "15%",
    }}
  />
</AbsoluteFill>
```

## Dark Theme Colors (WhatsApp style)

```tsx
const COLOR_BACKGROUND = "#0b141a";
const COLOR_SENT = "#1f8a70"; // Green for sent
const COLOR_RECEIVED = "#202c33"; // Dark gray for received
const COLOR_TEXT = "#e9edef"; // Light text
```

## Light Theme Colors (iMessage style)

```tsx
const COLOR_BACKGROUND = "#ffffff";
const COLOR_SENT = "#007AFF"; // Blue for sent
const COLOR_RECEIVED = "#E9E9EB"; // Light gray for received
const COLOR_TEXT_SENT = "#ffffff";
const COLOR_TEXT_RECEIVED = "#000000";
```
