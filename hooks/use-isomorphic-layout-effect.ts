import { useLayoutEffect, useEffect } from "react"

// 서버 사이드 렌더링에서는 useEffect를, 클라이언트 사이드 렌더링에서는 useLayoutEffect를 사용
export const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect
