"use server";
import { supabase } from "@/supabase/supabase-client";


// this function will upload an image to supabase, and return its url !

type GetImageURLType = {

  url: string,
  path: string

} | null

export async function GetImageURL(file: File): Promise<GetImageURLType> {

  try {
   

    const ext = file.name.split(".").pop();
    const filePath = `public/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from("image")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (error) throw error;

    const { data } = supabase.storage.from("image").getPublicUrl(filePath);

    console.log(data.publicUrl)
    return { url: data.publicUrl, path: filePath };
  }

  catch (err) {

    if (err instanceof Error) {

      console.error("Uploading avatar failed at GetImageURL >> ", err?.message);

    }

    return null;



  }


}
