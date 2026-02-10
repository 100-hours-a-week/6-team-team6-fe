"use client";

import { useState } from "react";

interface UsePostDetailUIStateResult {
	isDrawerOpen: boolean;
	setIsDrawerOpen: (open: boolean) => void;
	isDeleteDialogOpen: boolean;
	setIsDeleteDialogOpen: (open: boolean) => void;
}

function usePostDetailUIState(): UsePostDetailUIStateResult {
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	return {
		isDrawerOpen,
		setIsDrawerOpen,
		isDeleteDialogOpen,
		setIsDeleteDialogOpen,
	};
}

export { usePostDetailUIState };
export type { UsePostDetailUIStateResult };
