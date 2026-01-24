"use server";
import { MessageContentType } from "@/packages/shared/types";
import { supabase } from "@/supabase/supabase-client";


// this function will upload an image to supabase, and return its url !

type GetFileUrlType = {

  url: string,
  path: string

} | null

export async function GetFileUrl(
  file: File, type?: Omit<MessageContentType, "deleted">
): Promise<GetFileUrlType> {

  try {


    const ext = file.name.split(".").pop();
    const filePath = `public/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from("image")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: type as string || file.type, // if file type specified then use it!
      });

    if (error) throw error;

    const { data } = supabase.storage.from("image").getPublicUrl(filePath);

    console.log(data.publicUrl)
    return { url: data.publicUrl, path: filePath };
  }

  catch (err) {

    if (err instanceof Error) {

      console.error("Uploading file failed at GetFileUrl >> ", err?.message);

    }

    return null;



  }


}
