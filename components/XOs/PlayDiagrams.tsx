import {
  FourVerticalsDiagram,
  MeshDiagram,
  SmashDiagram,
  FloodDiagram,
  SpacingDiagram,
  CurlFlatDiagram,
  SailDiagram,
} from "./XosDiagrams";

const diagramComponents: Record<string, () => React.ReactNode> = {
  FourVerticalsDiagram: () => <FourVerticalsDiagram />,
  MeshDiagram: () => <MeshDiagram />,
  SmashDiagram: () => <SmashDiagram />,
  FloodDiagram: () => <FloodDiagram />,
  SpacingDiagram: () => <SpacingDiagram />,
  CurlFlatDiagram: () => <CurlFlatDiagram />,
  SailDiagram: () => <SailDiagram />,
};

interface PlayDiagramsProps {
  diagramType: string;
}

export function PlayDiagrams({ diagramType }: PlayDiagramsProps) {
  const DiagramComponent = diagramComponents[diagramType];

  if (!DiagramComponent) {
    return (
      <div className="text-center py-8 text-gray-500">
        Diagrama no disponible: {diagramType}
      </div>
    );
  }

  return <>{DiagramComponent()}</>;
}
