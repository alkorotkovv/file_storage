import { createApi } from '@reduxjs/toolkit/query/react';
import {axiosBaseQuery} from "../../../../../shared";

export const libraryApi = createApi({
  reducerPath: 'fileApi',
  tagTypes: ['Files', 'Folders'],
  baseQuery: axiosBaseQuery({
    baseUrl: '/temp_solutions/react_library'
  }),
  endpoints: (builder) => ({
    //Запрос дерева папок
    getFoldersTree: builder.query({
      query: (folder_id) => ({
        url: `/get_folders_tree/${folder_id}`,
        method: 'GET',
      }),
      providesTags: ['Folders'],
    }),

    //Запрос списка файлов в папке
    getFilesList: builder.query({
      query: (folder_id) => ({
        url: `/get_files_list/${folder_id}`,
        method: 'GET',
      }),
      providesTags: ['Files'],
    }),

    //Запрос свободного места в папке
    getFolderInfo: builder.query({
      query: (folder_id) => ({
        url: `/get_folder_info/${folder_id}`,
        method: 'GET',
      }),
      providesTags: ['Folders'],
    }),

    //Загрузка файла
    uploadFile: builder.mutation({
      query: (file) => ({
        url: `/upload_file`,
        method: 'POST',
        data: file,
        headers: {
          Accept: 'application/json',
        },
        formData: true,
      }),
      invalidatesTags: ['Files', 'Folders'],
    }),

    //Удаление файла
    deleteFile: builder.mutation({
      query: (file_id) => ({
        url: `/delete_file/${file_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Files', 'Folders'],
    }),

    //Скачивание файла
    downloadFile: builder.query({
      query: (file_id) => ({
        url: `/download_file/${file_id}`,
        method: 'GET',
        responseType: 'blob',
      }),
    }),

    //Открытие файла в браузере
    openFile: builder.query({
      query: (file_id) => ({
        url: `/open_file/${file_id}`,
        method: 'GET',
        responseType: 'blob',
      }),
    }),

  }),
});

export const {
  useGetFoldersTreeQuery,
  useGetFilesListQuery,
  useGetFolderInfoQuery,
  useUploadFileMutation,
  useDeleteFileMutation,
  useLazyDownloadFileQuery,
  useLazyOpenFileQuery,
} = libraryApi;
