import styles from './Main.module.css'
import { useState } from 'react';
import ReportHeader from "../../../components/ReportHeader/ReportHeader";
import FileUploader from "../FileUploader/FileUploader";
import { UploadOutlined, TableOutlined } from '@ant-design/icons';
import { Tabs } from 'antd';
import FilesTable from "../FilesTable/FilesTable";
import StorageProgress from '../StorageProgress/StorageProgress';
import {
  useGetFoldersTreeQuery,
  useGetFolderInfoQuery
} from '../../store/api/libraryApi';
import FoldersTree from "../FoldersTree/FoldersTree";
import type { Key } from 'rc-tree/lib/interface';

export default function Main() {

  const [selectedFolders, setSelectedFolders] = useState<Key[]>([2]);
  const [expandedFolders, setExpandedFolders] = useState<Key[]>([2]);
  const selectedFolder = selectedFolders[0]?.toString() ?? '';
  const { data: treeData, error: treeError, isLoading: isTreeLoading } = useGetFoldersTreeQuery(1);
  const { data: folderInfo, error: folderError, isLoading: isFolderLoading } = useGetFolderInfoQuery(selectedFolder, {
    skip: !selectedFolder, // пропускаем запрос если не выбранна папка
  });

  return (
    <div style={{width: '100%'}}>
      <ReportHeader title='БИБЛИОТЕКА'/>
      <div className={styles.content}>
          <FoldersTree
            treeData={treeData}
            selectedKeys={selectedFolders}
            expandedKeys={expandedFolders}
            onSelect={(keys, info) => setSelectedFolders(keys)}
            onExpand={(keys, info) => setExpandedFolders(keys)}
            loading={isTreeLoading}
          />
          <div style={{display: 'flex', flexDirection: 'column'}}>
            <StorageProgress
              selectedFolder={selectedFolder}
              used={folderInfo?.used ?? 0}
              total={folderInfo?.total ?? undefined}
              loading={isFolderLoading}
            />
            <Tabs
              defaultActiveKey="1"
              tabBarStyle={{padding: '0 8px'}}
              items={[
                {
                  key: '1',
                  label: (<span className={styles.tabTitle}><TableOutlined style={{marginRight: '4px'}}/>Список файлов</span>),
                  children:
                    selectedFolder
                      ? (<FilesTable selectedFolder={selectedFolder} />) 
                      : (<span className={styles.text}>Выберите папку для показа файлов</span>),
                },
                {
                  key: '2',
                  label: (<span className={styles.tabTitle}><UploadOutlined style={{marginRight: '4px'}}/>Загрузка файлов</span>),
                  children:
                    selectedFolder
                      ? (<FileUploader selectedFolder={selectedFolder} />) 
                      : (<span className={styles.text}>Выберите папку для загрузки файлов</span>),
                },
              ]}
            />
          </div>
      </div>
    </div>
  )
};
