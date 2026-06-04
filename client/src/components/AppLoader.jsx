function AppLoader({ message = "Loading ResumeIQ..." }) {
    return (
        <main className="app-loader" aria-live="polite" aria-busy="true">
            <div className="app-loader-card">
                <div className="app-loader-mark">RIQ</div>
                <div>
                    <h1>{message}</h1>
                    <p>Please wait a moment.</p>
                </div>
            </div>
        </main>
    );
}

export default AppLoader;
