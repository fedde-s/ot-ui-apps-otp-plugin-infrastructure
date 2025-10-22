import { gql } from "@apollo/client";
import {
  PlatformApiProvider,
  SectionContainer,
  SummaryContainer,
  summaryUtils,
  SectionsRenderer,
  SummaryRenderer,
} from "ui";
import { Target, Widget } from "sections";

import ProfileHeader from "./ProfileHeader";

import UploadModal from "./UploadModal";
import type { Widget as WidgetType } from "sections";

import { useQuery } from "@apollo/client";
import DummyQuery from "./DummyQuery.gql";

function widgetFactory(
  datasourcesMapped: Record<string, { data: string; Title: string; Acronym: string; Description: string, Label: string, Upper: string, Lower: string, Estimate: string, Dataset: string }>,
  query = false
): any {
  const targetProfileWidgets = new Map<string, Widget>([
    ...Object.keys(datasourcesMapped).map((source) => [source, Target.PluginData] as [string, Widget]),
    // [Target.KnownDrugs.definition.id, Target.KnownDrugs],
    [Target.Tractability.definition.id, Target.Tractability],
    [Target.Safety.definition.id, Target.Safety],
    [Target.Pharmacogenomics.definition.id, Target.Pharmacogenomics],
    [Target.QTLCredibleSets.definition.id, Target.QTLCredibleSets],
    [Target.ChemicalProbes.definition.id, Target.ChemicalProbes],
    [Target.Expression.definition.id, Target.Expression],
    [Target.DepMap.definition.id, Target.DepMap],
    [Target.SubcellularLocation.definition.id, Target.SubcellularLocation],
    [Target.GeneOntology.definition.id, Target.GeneOntology],
    [Target.GeneticConstraint.definition.id, Target.GeneticConstraint],
    [Target.MolecularStructure.definition.id, Target.MolecularStructure],
    [Target.MolecularInteractions.definition.id, Target.MolecularInteractions],
    [Target.Pathways.definition.id, Target.Pathways],
    [Target.CancerHallmarks.definition.id, Target.CancerHallmarks],
    [Target.MousePhenotypes.definition.id, Target.MousePhenotypes],
    [Target.ComparativeGenomics.definition.id, Target.ComparativeGenomics],
    [Target.Bibliography.definition.id, Target.Bibliography],
  ]);

  const TARGET_WIDGETS_WITH_INFO = Array.from(targetProfileWidgets.entries()).map(([key, widget]) => ({
    data: datasourcesMapped[key]?.data,
    title: datasourcesMapped[key]?.Title,
    acronym: datasourcesMapped[key]?.Acronym,
    description: datasourcesMapped[key]?.Description,
    label: datasourcesMapped[key]?.Label,
    upper: datasourcesMapped[key]?.Upper,
    lower: datasourcesMapped[key]?.Lower,
    estimate: datasourcesMapped[key]?.Estimate,
    dataset: datasourcesMapped[key]?.Dataset,
    widget,
  }));

  const targetProfileWidgetsSummaries = Array.from(targetProfileWidgets.values()).map(
    widget => widget.Summary
  );

  const TARGET_PROFILE_SUMMARY_FRAGMENT = summaryUtils.createSummaryFragment(
    targetProfileWidgetsSummaries,
    "Target"
  );
  const TARGET_PROFILE_QUERY = gql`
    query TargetProfileQuery($ensgId: String!) {
      target(ensemblId: $ensgId) {
        id
        ...TargetProfileHeaderFragment
        ...TargetProfileSummaryFragment
      }
    }
    ${ProfileHeader.fragments.profileHeader}
    ${TARGET_PROFILE_SUMMARY_FRAGMENT}
  `;

  if (query) {
    return TARGET_PROFILE_QUERY;
  }
  return TARGET_WIDGETS_WITH_INFO;
}

const TARGET = "target";



import { useState } from "react";



function Profile({ ensgId, symbol }: { ensgId: string; symbol: string }) {

  const { data, loading, error } = useQuery(DummyQuery, { variables: { ensgId } });

  // MAP data to something like: "plugin data 8": {data: "forestplot", Dataset: "example_mr_data.json", Title: 'Example MR Data', Acronym: 'MR', Description: 'Mendelian Randomization data description', Label: 'method', Upper: 'se', Lower: 'se', Estimate: 'b'},

  // use mapped data here.
  const [datasourcesMapped, setDatasourcesMapped] = useState<Record<string, { data: string; Title: string; Acronym: string; Description: string, Label: string, Upper: string, Lower: string, Estimate: string, Dataset: string }>>({
    // "plugin data 1": {data: "example_data.json", Title: 'Example Data 1', Acronym: 'ED', Description: 'Description for Example Data 1'},
    // "plugin data 2": {data: "table", Dataset: "example_data2.json", Title: 'Example Data 2', Acronym: 'AP', Description: 'Cool stuff about Example Data 2'},
    // "plugin data 3": {data: "example_data3.json", Title: 'Example Data 3', Acronym: 'GP', Description: 'Nice'},
    // "plugin data 4": {data: "example_data4.json", Title: 'Example Data 4', Acronym: 'OP', Description: 'Open Targets rocks!'},
    // "plugin data 5": {data: "table", Dataset: "example_data5.json", Title: 'Example Data 5', Acronym: 'JK', Description: 'Hackat10!'},
    // "plugin data 6": {data: "Bread_Height.json", Title: 'Bread Height', Acronym: 'BH', Description: 'Description for Bread Height'},
    "plugin data 7": {data: "table", Dataset: "Education_Dementia.json", Title: 'Education Dementia', Acronym: 'ED', Description: 'Description for Education Dementia'},
    "plugin data 8": {data: "forestplot", Dataset: "example_mr_data.json", Title: 'Example MR Data', Acronym: 'MR', Description: 'Mendelian Randomization data description', Label: 'method', Upper: 'se', Lower: 'se', Estimate: 'b'},
    // "plugin data 9": {data: "sleep_duration_cognitive_performance.json", Title: 'Sleep Duration Cognitive Performance', Acronym: 'SP', Description: 'Description for Sleep Duration Cognitive Performance'},
    // "plugin data 10": {data: "brain_region_activation.json", Title: 'Brain Region Activation', Acronym: 'BRA', Description: 'Description for Brain Region Activation'},
    "plugin data 11": {data: "table", Dataset: "gut_microbes.json", Title: 'Gut microbiome abundance and metabolite associations', Acronym: 'GM', Description: 'Description for Gut Microbes'},
  });

  // Handler to add a new uploaded data source
  const handleUpload = ({ title, acronym, description, visualization, label, upper, lower, estimate, dataset }: { title: string; acronym: string; description: string; visualization: any, label: string, upper: string, lower: string, estimate: string, dataset: string }) => {
    if (!title) return;
    setDatasourcesMapped(prev => ({
      ...prev,
      [title]: {
        // data: JSON.stringify(data),
        data: visualization,
        Title: title,
        Acronym: acronym || '',
        Description: description || '',
        Label: label || '',
        Upper: upper || '',
        Lower: lower || '',
        Estimate: estimate || '',
        Dataset: dataset || '',
      },
    }));
  };

  return (
    <PlatformApiProvider entity={TARGET} query={widgetFactory(datasourcesMapped, true)} variables={{ ensgId }}>
      <ProfileHeader />
      <UploadModal onUploadSuccess={handleUpload} />
      <SummaryContainer>
        <SummaryRenderer widgets={widgetFactory(datasourcesMapped) as WidgetType[]} />
      </SummaryContainer>
      <SectionContainer>
        <SectionsRenderer id={ensgId} label={symbol} entity={TARGET} widgets={widgetFactory(datasourcesMapped) as WidgetType[]} />
      </SectionContainer>
    </PlatformApiProvider>
  );
}

export default Profile;
