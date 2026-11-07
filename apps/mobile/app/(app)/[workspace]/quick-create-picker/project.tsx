/**
 * Project picker route for the in-progress Quick Create (agent-mode) draft.
 * Uses the same native iOS Stack header + UISearchController pattern as
 * `new-issue-picker/project.tsx`.
 */
import { router } from "expo-router";
import { ProjectPickerBody } from "@/components/issue/pickers/project-picker-body";
import { useQuickCreateDraftStore } from "@/data/stores/quick-create-draft-store";
import { useNativeSearchBar } from "@/lib/use-native-search-bar";
import { useT } from "@/lib/i18n/use-translation";

export default function QuickCreateProjectPickerRoute() {
  const t = useT();
  const project = useQuickCreateDraftStore((s) => s.project);
  const setProject = useQuickCreateDraftStore((s) => s.setProject);
  const query = useNativeSearchBar(t.issues.searchProjects, { autoFocus: true });

  return (
    <ProjectPickerBody
      value={project}
      query={query}
      onChange={(next) => {
        setProject(next);
        router.back();
      }}
    />
  );
}
