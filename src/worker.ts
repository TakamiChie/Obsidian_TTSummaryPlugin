export interface NameEntry{
  name: string;
  id: number;
}

export interface TimeEntry{
  name: string;
  duration: number;
}

async function request(apiname: string, apiKey: string): Promise<any>  {
  const response = await fetch(
    `https://api.track.toggl.com/api/v9/${apiname}`,
    {
      headers: {
        Authorization: `Basic ${Buffer.from(`${apiKey}:api_token`).toString("base64")}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Data acquisition failed.');
  }

  return await response.json();
}

export async function getWorkspaceList(apiKey: string): Promise<NameEntry[]> {
  const ret = await request("workspaces", apiKey);
  return Array.from(ret).map((n: {[key:string]:string}) => { 
    return {
      name: n["name"], 
      id: parseInt(n["id"])
    }
  });
}

export async function getFootprint(apiKey: string, startDate: Date, endDate: Date, workspace?: NameEntry): Promise<TimeEntry[]> {
  const toS = (d: Date) => { return d.toISOString().split('T')[0];}
  const wid = workspace ? workspace.id : 0; 
  const ret = await request(`me/time_entries?start_date=${toS(startDate)};end_date=${toS(endDate)}`, apiKey);
  const filterd = Array.from(ret).filter((n: {[key:string]:string}) => wid == 0 || parseInt(n.workspace_id) == wid);
  return filterd.map((n: {[key:string]:string}) => {
    return {
      name: n["description"],
      duration: parseInt(n["duration"])
    }
  } );
}
