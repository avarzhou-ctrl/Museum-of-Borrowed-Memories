(() => {
  "use strict";

  const rectangle = (left, top, right, bottom) => [
    { x: left, y: top },
    { x: right, y: top },
    { x: right, y: bottom },
    { x: left, y: bottom }
  ];

  // Coordinates are percentages of the fixed gallery viewport. Exhibit polygons
  // include a small clearance beyond the painted glass and pedestal edges.
  window.MUSEUM_ROOM_COLLISION = {
    coordinateSpace: { width: 100, height: 100, units: "percent" },
    walkablePolygon: [
      { x: 6.5, y: 57.5 }, { x: 10, y: 54 }, { x: 22, y: 51.5 },
      { x: 34, y: 49 }, { x: 43, y: 47 }, { x: 57, y: 47 },
      { x: 66, y: 49 }, { x: 78, y: 51.5 }, { x: 90, y: 55 },
      { x: 96, y: 61.5 }, { x: 99, y: 99 }, { x: 1, y: 99 },
      { x: 4, y: 63 }
    ],
    obstacles: [
      {
        id: "raincoat", exhibitId: "raincoat", type: "memory-display",
        margin: { x: .6, y: .7 }, interactionPoint: { x: 18, y: 83 },
        polygon: rectangle(11.4, 35.55, 24.55, 81.25)
      },
      {
        id: "teacup", exhibitId: "teacup", type: "memory-display",
        margin: { x: .65, y: .7 }, interactionPoint: { x: 28.5, y: 97 },
        polygon: rectangle(22.9, 65.4, 33.9, 95.3)
      },
      {
        id: "umbrella", exhibitId: "umbrella", type: "memory-display",
        margin: { x: .65, y: .7 }, interactionPoint: { x: 35.2, y: 75 },
        polygon: rectangle(30.55, 38.3, 39.9, 73.4)
      },
      {
        id: "glassOrchard", exhibitId: "orchard", type: "memory-display",
        margin: { x: .7, y: .75 }, interactionPoint: { x: 50, y: 69 },
        polygon: rectangle(41.9, 32.1, 57.15, 66.55)
      },
      {
        id: "musicBox", exhibitId: "musicbox", type: "memory-display",
        margin: { x: .65, y: .7 }, interactionPoint: { x: 63, y: 74 },
        polygon: rectangle(58.1, 42.55, 67.95, 72.05)
      },
      {
        id: "guestbook", exhibitId: "guestbook", type: "memory-display",
        margin: { x: .7, y: .7 }, interactionPoint: { x: 76, y: 89 },
        polygon: rectangle(66, 54.55, 85.75, 87.3)
      },
      {
        id: "elevatorButton", exhibitId: "elevator", type: "memory-display",
        margin: { x: .7, y: .7 }, interactionPoint: { x: 91, y: 97 },
        polygon: rectangle(87.4, 56.35, 99.35, 94.55)
      },
      {
        id: "orchardRopeLeft", type: "rope-barrier", margin: { x: .5, y: .5 },
        polygon: [
          { x: 38.35, y: 61.5 }, { x: 42.6, y: 61.5 },
          { x: 42.6, y: 67.35 }, { x: 38.35, y: 67.35 }
        ]
      },
      {
        id: "orchardRopeRight", type: "rope-barrier", margin: { x: .5, y: .5 },
        polygon: [
          { x: 56.45, y: 61.5 }, { x: 60.15, y: 61.5 },
          { x: 60.15, y: 67.35 }, { x: 56.45, y: 67.35 }
        ]
      },
      {
        id: "rearWall", type: "wall", margin: { x: 0, y: 0 },
        polygon: rectangle(0, 0, 100, 47)
      },
      {
        id: "leftArchitecture", type: "decorative-column", margin: { x: 0, y: 0 },
        polygon: [
          { x: 0, y: 47 }, { x: 11.5, y: 47 }, { x: 10, y: 57 },
          { x: 6.5, y: 64 }, { x: 0, y: 67 }
        ]
      },
      {
        id: "rightArchitecture", type: "decorative-column", margin: { x: 0, y: 0 },
        polygon: [
          { x: 88.5, y: 47 }, { x: 100, y: 47 }, { x: 100, y: 67 },
          { x: 95, y: 64 }, { x: 91, y: 57 }
        ]
      }
    ]
  };
})();
