import { getData } from "../data";
import { Gantt } from "../../src";
import { Toolbar, registerToolbarItem } from "@wx/react-toolbar";
import UploadButton from "../custom/UploadButton";
import { useCallback, useState } from "react";

import './ProMSProject.css';

registerToolbarItem("upload", UploadButton);
export default function ProMSProject({ skinSettings }) {
    const data = getData();
    const [api, setApi] = useState();

    const handleClick = useCallback(({ item }) => {
        if (item.id === "export") {
            api.exec("export-data", { format: "mspx" });
        }
    }, [api]);

    const importMSProject = useCallback(() => {
        const file = document.getElementById("import-file").files[0];
        const reader = new FileReader();
        reader.onload = e => {
            const xml = e.target.result;
            api.exec("import-data", {
                data: xml,
            });
        };
        reader.readAsText(file);
    }, [api]);

    const items = [
        {
            id: "export",
            comp: "button",
            text: "Download MS Project XML",
        },
        {
            id: "import",
            comp: "upload",
            text: "Upload MS Project XML",
            onChange: importMSProject,
        },
    ];

    return (
        <>
            <Toolbar items={items} onClick={handleClick} />
            <div className="gtcell">
                <Gantt
                    init={setApi}
                    {...skinSettings}
                    tasks={data.tasks}
                    links={data.links}
                    scales={data.scales}
                />
            </div>
        </>
    );
}