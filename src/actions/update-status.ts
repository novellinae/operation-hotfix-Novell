'use server'

import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function updateShipmentStatus(id: string, status: string) {
  // Adding debug log (error)
  const { error } =  await supabase
  .from('shipments')
  .update({ status })
  .eq('id', id)
  .select() // menampilkan hasil update
  .single() // retun single data

  if(error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard')
  // TODO: surface errors to caller
  return { success: true }
}


//update merupakan async operation, namun disini tidak diberlakukan await sehingga
// ketika client click update server action dipanggil dan query dijalankan namun server langsung mereturn success
// tanpa menunggu proses update query selesai sehingga ketika client refresh, query update mungkin belum selesai
// sehingga status shipment jadi tidak terupdate pada dahsboard page ketika client refresh/