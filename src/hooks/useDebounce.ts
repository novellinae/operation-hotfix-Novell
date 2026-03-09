"use client"
import { useEffect, useState } from "react";

// Debounce -> menungggu user berhenti mengetik beberapa milidetik sebelum melakukan request
// Goalsnya -> ngurangin request ke server
// dari yang tiap ngetik jadi satu request -> request jadi banyak,
//tapi pakai debounce -> nunggu user beres ngetik dulu -> ga boros request -> bisa jadi 1 request doang
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            clearTimeout(handler)
        }
    }, [value, delay])

    return debouncedValue
}