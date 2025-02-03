//
export const Maintenance = () => {
    return (
        <div className="flex flex-col gap-5 items-center justify-center h-screen w-screen">
            <img
                src="/images/maintenance.png"
                className="w-full max-w-[300px]"
            />
            <h1 data-testid="INIT" className="text-3xl font-bold text-center">
                Scheduled Maintenance Notice
            </h1>
            <p className="text-xl font-bold text-center">
                We're performing essential maintenance to improve your
                experience
            </p>
        </div>
    );
};
