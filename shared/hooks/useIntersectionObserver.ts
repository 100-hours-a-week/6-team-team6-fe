"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type UseIntersectionObserverParams = {
	onIntersect: (
		entry: IntersectionObserverEntry,
		observer: IntersectionObserver,
	) => void;
	root?: Element | null;
	rootMargin?: string;
	threshold?: number | number[];
	enabled?: boolean;
};

type UseIntersectionObserverResult<T extends Element> = {
	setTarget: (node: T | null) => void;
};

export function useIntersectionObserver<T extends Element>(
	params: UseIntersectionObserverParams,
): UseIntersectionObserverResult<T> {
	const { onIntersect, root = null, rootMargin, threshold = 0, enabled = true } = params;
	const [target, setTarget] = useState<T | null>(null);
	const savedCallback = useRef(onIntersect);

	useEffect(() => {
		savedCallback.current = onIntersect;
	}, [onIntersect]);

	const handleIntersect = useCallback(
		(entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					savedCallback.current(entry, observer);
				}
			});
		},
		[],
	);

	useEffect(() => {
		if (!enabled || !target) {
			return;
		}

		if (typeof IntersectionObserver === "undefined") {
			return;
		}

		const observer = new IntersectionObserver(handleIntersect, {
			root,
			rootMargin,
			threshold,
		});

		observer.observe(target);

		return () => {
			observer.disconnect();
		};
	}, [enabled, handleIntersect, root, rootMargin, target, threshold]);

	const setObservedTarget = useCallback((node: T | null) => {
		setTarget(node);
	}, []);

	return { setTarget: setObservedTarget };
}
