
interface TimeEntry {
  project: string;
  duration: number;
}

interface ProjectData {
  duration: number;
}

interface Projects {
  [key: string]: ProjectData;
}

interface AggregatedData {
  projects: Projects;
  totalDuration: number;
}

export async function fetchData(apiKey: string,startDate: Date, endDate: Date): Promise<TimeEntry[]>  {
  const toS = (d: Date) => { return d.toISOString().split('T')[0];}
  const response = await fetch(
    `https://api.track.toggl.com/api/v8/time_entries?start_date=${toS(startDate)}&end_date=${toS(endDate)}`,
    {
      headers: {
        Authorization: `Basic ${Buffer.from(`${apiKey}:api_token`, "base64")}`,
      }
    }
  );

  if (!response.ok) {
    throw new Error('Data acquisition failed.');
  }

  return await response.json();
}

export function aggregateProjects(entries: TimeEntry[]): AggregatedData {
  const projects: Projects = {};
  let totalDuration = 0;

  entries.forEach(entry => {
    const projectName: string = entry.project;

    if (!projects[projectName]) {
      projects[projectName] = {
        duration: 0,
      };
    }

    projects[projectName].duration += entry.duration;
    totalDuration += entry.duration;
  });

  return {
    projects,
    totalDuration,
  };
}

export function sortProjectsByDuration(projects: Projects): [string, ProjectData][] {
  const sortedProjects: [string, ProjectData][] = Object.entries(projects).sort(
    (a, b) => b[1].duration - a[1].duration
  );

  return sortedProjects;
}

export async function aggregateWeekly(apiKey: string, fromDate: Date, toDate: Date): string {
  try {
    const entries: TimeEntry[] = await fetchData(apiKey, fromDate, toDate); 
    const { projects, totalDuration } = aggregateProjects(entries);
    const sortedProjects: [string, ProjectData][] = sortProjectsByDuration(projects);
    let result = "";
    sortedProjects.slice(0, 3).forEach(([projectName, projectData]) => {
      const duration: number = projectData.duration / 1000 / 60 / 60;
      const percentage: string = ((duration / totalDuration) * 100).toFixed(2);
      result += `${projectName}: ${duration}時間 (${percentage}%)\n`;
    });
    return result;
  } catch (error) {
    console.error('Error:', error.message);
  }
}
