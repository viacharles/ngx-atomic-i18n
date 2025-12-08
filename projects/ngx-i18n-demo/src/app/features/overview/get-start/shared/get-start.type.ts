import { ToForm } from "@demo2-shared/interfaces/util.interface";
import { AppBootstrapMode, ProjectArchitectureType, RenderType } from "./get-start.enum";

export interface SetUpConfig {
  renderType: RenderType,
  projectArchitecture: ProjectArchitectureType,
  appBootstrapMode: AppBootstrapMode
}

export type SetUpConfigForm = ToForm<SetUpConfig>;
