import { ProjectMarquee } from "@/components/sections/ProjectMarquee";
import { ProjectShowcase } from "@/components/sections/ProjectShowcase";
import { PROJECTS } from "@/lib/projects";

export function SelectedWork() {
  return (
    <>
      <ProjectShowcase project={PROJECTS[0]} id="work" />
      <ProjectMarquee />
    </>
  );
}
