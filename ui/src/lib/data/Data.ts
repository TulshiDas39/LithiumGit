import { Annotation } from "common_library";

export class Data{
    static annotations:Annotation[] = [];
    static get newChangesInLatestVersion(){
        return ["Enhanced user interface for better usability.",
                "Improve user experience.",
                "Show file properties of binary files in diff view.",
                "Force push from the UI.",
                "Revert commits from the UI of graph.",
                "User interface to display app information.",
                "Show new changes of latest release.",
                "Deleting repositories from recent list."
            ];
    }
}