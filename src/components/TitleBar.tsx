interface TitleBarProps {
    title: string;
    setTitle: (title: string) => void;
    hasError?: boolean;
}

function TitleBar(props: TitleBarProps) {
    return (
        <div className={`${props.hasError ? "bg-red-800" : "bg-slate-700"} mb-2 rounded-md`}>
            <input
                type="text"
                value={props.title}
                onChange={(e) => props.setTitle(e.target.value)}
                className="text-2xl text-slate-200 px-2 py-2 w-full"
                placeholder="Enter title"
            />
        </div>
    )
}

export default TitleBar;