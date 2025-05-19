import { FC } from 'react';
import { Tree,Spin } from 'antd';
const { DirectoryTree } = Tree;
import type { DataNode, DirectoryTreeProps } from 'antd/es/tree';
import styled from 'styled-components';
import styles from "./FoldersTree.module.css";
import type { Key } from 'rc-tree/lib/interface';

interface FolderProps extends DirectoryTreeProps {
  treeData: DataNode[];
  selectedKeys: Key[];
  expandedKeys?: Key[];
  loading?: boolean;
}

const StyledFoldersTree = styled(DirectoryTree)<DirectoryTreeProps>`
  .ant-tree-node-selected::before {
    background-color: #8a9fde !important;
  }

  .ant-tree-node-selected:hover {
    background-color: #a5b9fc !important;
    color: white !important;
  }
`;

const FoldersTree: FC<FolderProps> = ({
  treeData,
  selectedKeys,
  expandedKeys,
  onSelect,
  onExpand,
  loading
}) => {

console.log(treeData)
console.log(expandedKeys)

  return (
    <div className={styles.tree}>
      {
        loading
          ? <Spin size="large" style={{display: 'flex', justifyContent: 'center', padding: '20%'}}/>
          : <StyledFoldersTree
              treeData={treeData}
              selectedKeys={selectedKeys}
              expandedKeys={expandedKeys}
              onSelect={onSelect}
              onExpand={onExpand}
              draggable={false}
              blockNode={true}
            />
      }      
    </div>
  );
};

export default FoldersTree;