export function ConflictBottomPanel(){
    return <div className="h-100 w-100 d-flex conflict-bottom">
        <div className="noselect line_numbers overflow-y-hidden h-100"></div>
        <div className="h-100 content-container overflow-auto flex-grow-1">
            <div className="ps-1 content fit-content min-w-100"></div>
        </div>
    </div>
}
