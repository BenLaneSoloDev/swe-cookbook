const locations = ["Hub", "Station_A", "Station_B", "Station_C", "Dropoff", "Isolated_Zone"];

// Directed Roads: [From, To, TimeInMinutes]
const roads: [string, string, number][] = [
  ["Hub", "Station_A", 4],
  ["Hub", "Station_B", 2],
  ["Station_A", "Station_C", 5],
  ["Station_B", "Station_A", 1],
  ["Station_B", "Station_C", 8],
  ["Station_B", "Dropoff", 10],
  ["Station_C", "Dropoff", 2],
];

const start = "Hub";
const destination = "Dropoff";





function minDeliveryTime(locaions: string[], roads: [string, string, number][], start: string, destination: string): number {
  
  const graph = new Map<string, Array<{ to: string; time: number }>>();

  for (const [from, to, time] of roads) {
    if (!graph.has(from)) {
      graph.set(from, []);
    }
    graph.get(from)!.push({ to, time });
  }

  const bestTimes = new Map<string, number>();
  for (const loc of locations) {
    bestTimes.set(loc, Infinity);
  }
  bestTimes.set(start, 0);

  const frontier: Array<{ location: string; totalTime: number }> = [
    { location: start, totalTime: 0 }
  ];



  return -1;
};

console.log(minDeliveryTime(locations, roads, start, destination));