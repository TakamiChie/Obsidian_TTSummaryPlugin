import { getFootprint, getWorkspaceList } from "../src/worker";
import 'dotenv/config';

describe("options", () => {
  test("workspaces", async () => {
    const ws = await getWorkspaceList(process.env.APIKEY || "");
    expect(ws.length).toBeGreaterThan(1);
  });

  test("timeEntries(All)", async () => {
    const te = await getFootprint(process.env.APIKEY || "", new Date(new Date().getTime() - 86400000), new Date());
    expect(te.length).toBeGreaterThan(1);
  });

  test("timeEntries(Workspace)", async () => {
    const ws = await getWorkspaceList(process.env.APIKEY || "");
    const te = await getFootprint(process.env.APIKEY || "", new Date(new Date().getTime() - 86400000), new Date());
    const te2 = await getFootprint(process.env.APIKEY || "", new Date(new Date().getTime() - 86400000), new Date(), ws.pop());
    expect(te.length).not.toBe(te2.length);
  });
});