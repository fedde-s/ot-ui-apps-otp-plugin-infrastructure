import Description from "./Description";
import { sentenceCase } from "@ot/utils";

import { naLabel, phaseMap } from "@ot/constants";
import { KnownDrugsSourceDrawer, Link, OtTable, SectionItem } from "ui";
import { useState, useEffect } from "react";
import { get } from "3dmol";
import ForestPlot from "./ForestPlot";

function getColumns(ids) {
  return ids.map((id) => ({
    id: id,
    label: sentenceCase(id),
    enableHiding: true,
    renderCell: (data) => {
      return <>{String(data[id])}</>;
    }
  }));
}

function Body({ id: ensgId, label: name, entity, dataset, title, acronym, description, label2, upper, lower, estimate, dataset2 }) {
  const [jsonData, setJsonData] = useState(null);
  const [loading, setLoading] = useState(true);

  const definition = {
    id: "plugin",
    name: title,
    shortName: acronym,
    hasData: () => true,
    isPlugin: true,
  };

  useEffect(() => {

    if (dataset2==='sessionStorage') {
      // New: Load from sessionStorage using acronym as key
      try {
        const stored = sessionStorage.getItem(acronym);
        if (stored) {
          const jsonObjects = JSON.parse(stored);
          setJsonData(jsonObjects);
        }
      } catch (e) {
        setJsonData(null);
      }
      setLoading(false);
    }
    else {
      // Old fetch code (kept for reference):
      fetch(`/${dataset2}`)
        .then(response => response.text())
        .then(text => {
          const lines = text.split('\n').filter(Boolean);
          const jsonObjects = lines.map(line => JSON.parse(line));
          setJsonData(jsonObjects);
          setLoading(false);
        });
    }
  }, [setJsonData, acronym]);

  const [request, setRequest] = useState({ loading: true, data: null, error: false });
  const keys = jsonData && jsonData.length > 0 ? Object.keys(jsonData[0]) : [];

  if (dataset==='forestplot') {
    return (
      <>
        <SectionItem
          definition={definition}
          entity={entity}
          request={request}
          renderDescription={() => <Description text={description} />}
          renderChart={() => (
            <ForestPlot
              data={jsonData}
              height={400}
              label={label2}
              upper={upper}
              lower={lower}
              estimate={estimate}
            />
          )}
          renderBody={() => (
            <OtTable
              showGlobalFilter
              dataDownloader
              dataDownloaderFileStem={`plugin-data`}
              columns={getColumns(keys)}
              rows={jsonData}
              // query={MOUSE_PHENOTYPES_QUERY.loc.source.body}
              // variables={variables}
              loading={loading}
            />
          )}
        />
      </>
    )
  }
  else if (dataset==='table') {
    return (
      <>
        <SectionItem
          definition={definition}
          entity={entity}
          request={request}
          renderDescription={() => <Description text={description} />}
          renderBody={() => (
            <OtTable
              showGlobalFilter
              dataDownloader
              dataDownloaderFileStem={`plugin-data`}
              columns={getColumns(keys)}
              rows={jsonData}
              // query={MOUSE_PHENOTYPES_QUERY.loc.source.body}
              // variables={variables}
              loading={loading}
            />
          )}
        />
      </>
    )
  }
}

export default Body;
