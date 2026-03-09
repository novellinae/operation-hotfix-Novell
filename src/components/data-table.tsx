'use client'

import { searchShipments } from '@/actions/search-shipments'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useDebounce } from '@/hooks/useDebounce'
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  'use no memo'
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sorting, setSorting] = useState<SortingState>([])
  const [tableData, setTableData] = useState<TData[]>(data)
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState("")
  const latestQueryRef = useRef("")

  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    const runSearch = async () => {
      const currentQuery = debouncedQuery // set lama waktu debouncenya
      latestQueryRef.current = currentQuery //mengunci query yang digunakan untuk request tersebut
      if(!currentQuery.trim()) {
        setTableData(data) // kalo kosong return data awal yang full rows
        setLoading(false)
        return
      }
      setLoading(true)
      const results = await searchShipments(currentQuery)  //server action buat searching
      if(latestQueryRef.current === currentQuery){ //mengabaikan response lama jika false jadi response dan query harus sama (latestquery -> keadaan field saat ini, currentQuery -> responsenya)
        setTableData(results as TData[])
      }
      setLoading(false)
    }

    runSearch()
  }, [debouncedQuery,data]) //dependency data buat reset table biar ga ngaco

  useEffect(() => {
    setTableData(data)
  }, [data])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: tableData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  useEffect(() => {
    console.log("effect triggered", {
      sorting,
      searchParams: searchParams.toString()
    })
    const params = new URLSearchParams(searchParams.toString())
    if (sorting.length > 0) {
      params.set('sort', sorting[0].id)
      params.set('desc', String(sorting[0].desc))
    } else {
      params.delete('sort')
      params.delete('desc')
    }
    router.push(`/dashboard?${params.toString()}`)
  }, [sorting]) 

  // hanya bergantung pada dependency sorting aja buat menghindari infinite navigation loop -> trigger cuman pas ngelakuin sorting baru dia update url
  // sedangkan sebelumnya kita ada pakai searchParams as dependency dimana useSearchParams nya return object reference baru setiap render
  // Ketika router push update url -> component rerender (dependency yang bikin rerender)
  // karena urlnya berubah maka hal ini menciptakan searchParams object yang baru dimana ini jadinya ngetrigger useEffect lagi buat manggil function pas component beres render
  // sehingga muncul infinite navigation loop, maka opsi terbaiknya hanya pakai sorting karena effect cuman jalan kalo user ganti sorting state


  // search harus dipanggil debounce effect aja -> bukan dari input handler, kalo dua duanya manggil search bakal muncul puluhan request
  // maka handleSearch hanya mengupdate state saja
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => { //async tidak digunakan lagi karena sudah ada debounce tidak perlu menunggu process query selesai karena ketika
    const query = e.target.value
    setQuery(query)
  }

  return (
    <div>
      <div className='mb-4 flex items-center gap-3'>
        <input
          type='text'
          placeholder='Search by item...'
          onChange={handleSearch}
          className='flex h-9 w-64 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
        />
        {loading && (
          <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent' />
        )}
      </div>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className='cursor-pointer select-none'
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    {header.column.getIsSorted() === 'asc' && ' ↑'}
                    {header.column.getIsSorted() === 'desc' && ' ↓'}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center text-muted-foreground'
                >
                  No Data Found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
