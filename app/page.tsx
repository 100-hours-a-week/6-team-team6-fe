"use client";

import { useQuery } from "@tanstack/react-query";

type DummyResponse = {
	data: string;
};

async function fetchDummyData(): Promise<DummyResponse> {
	const response = await fetch("/dummy/test.json");

	if (!response.ok) {
		throw new Error("Failed to load dummy data");
	}

	return response.json();
}

export default function Page() {
	const { data, isError, isLoading, error } = useQuery<DummyResponse, Error>({
		queryKey: ["dummy-test"],
		queryFn: fetchDummyData,
	});

	if (isLoading) {
		return <main>Loading...</main>;
	}

	if (isError) {
		return (
			<main>
				<p>Failed to load data.</p>
				<pre>{error.message}</pre>
			</main>
		);
	}

	if (!data) {
		return <main>No data available.</main>;
	}

	return (
		<main>
			<h1>Dummy Data</h1>
			<p>{data.data}</p>
		</main>
	);
}
