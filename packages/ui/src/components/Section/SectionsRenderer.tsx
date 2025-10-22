import { Suspense } from "react";
import { Widget } from "sections";
import usePermissions from "../../hooks/usePermissions";
import SectionLoader from "./SectionLoader";

type SectionsRendererProps = {
  id: string | { ensgId: string; efoId: string };
  label: string | { symbol: string; name: string };
  entity: string;
  widgets: Widget[];
};

function SectionsRenderer({ id, label, entity, widgets }: SectionsRendererProps) {
  const { isPartnerPreview } = usePermissions();
  return (
    <>
      {widgets.map(({ data, title, acronym, description, label: label2, upper, lower, estimate, dataset, widget }) => {
        const Body = widget.getBodyComponent();
        const isPrivate = widget.definition.isPrivate;
        if (isPrivate && !isPartnerPreview) {
          return null;
        }
        return (
          <Suspense key={widget.definition.id} fallback={<SectionLoader />}>
            <Body id={id} label={label} entity={entity} dataset={data} title={title} acronym={acronym} description={description} label2={label2} upper={upper} lower={lower} estimate={estimate} dataset2={dataset} />
          </Suspense>
        );
      })}
    </>
  );
}

export default SectionsRenderer;
