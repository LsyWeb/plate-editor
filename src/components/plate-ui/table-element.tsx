'use client';

import React from 'react';

import type * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import {
  deleteTable,
  getEmptyCellNode,
  getEmptyTableNode,
  getTableEntries,
  insertTableColumn,
  insertTableRow,
  type TTableElement,
} from '@udecode/plate-table';

import { PopoverAnchor } from '@radix-ui/react-popover';
import { cn, withRef } from '@udecode/cn';
import {
  getNode,
  getNodes,
  isSelectionExpanded,
  someNode,
} from '@udecode/plate-common';
import {
  focusEditor,
  useEditorPlugin,
  useEditorRef,
  useEditorSelector,
  useElement,
  useRemoveNodeButton,
  withHOC,
} from '@udecode/plate-common/react';
import {
  TableCellHeaderPlugin,
  TablePlugin,
  TableProvider,
  deleteColumn,
  deleteRow,
  insertTable,
  mergeTableCells,
  unmergeTableCells,
  useTableBordersDropdownMenuContentState,
  useTableElement,
  useTableElementState,
  useTableMergeState,
} from '@udecode/plate-table/react';
import {
  type LucideProps,
  CheckIcon,
  Combine,
  Divide,
  Minus,
  PanelLeft,
  PanelTop,
  Plus,
  RectangleHorizontal,
  RectangleVertical,
  Table,
  Trash,
  Trash2Icon,
  Ungroup,
} from 'lucide-react';
import { useReadOnly, useSelected } from 'slate-react';

import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  useOpenState,
} from './dropdown-menu';
import { PlateElement } from './plate-element';
import { Popover, PopoverContent, popoverVariants } from './popover';
import { TableCellHeaderElement } from './table-cell-element';
import { Content } from '@radix-ui/react-dropdown-menu';
import { setNodes } from 'slate';
import Divider from '../common/divider';

export const TableBordersDropdownMenuContent = withRef<typeof Content>(
  (props, ref) => {
    const {
      getOnSelectTableBorder,
      hasBottomBorder,
      hasLeftBorder,
      hasNoBorders,
      hasOuterBorders,
      hasRightBorder,
      hasTopBorder,
    } = useTableBordersDropdownMenuContentState();

    return (
      <DropdownMenuContent
        ref={ref}
        className={cn('min-w-[220px]')}
        align="start"
        side="right"
        sideOffset={0}
        {...props}
      >
        <DropdownMenuGroup>
          <DropdownMenuCheckboxItem
            checked={hasBottomBorder}
            onCheckedChange={getOnSelectTableBorder('bottom')}
          >
            <BorderBottom />
            <div>下边框</div>
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={hasTopBorder}
            onCheckedChange={getOnSelectTableBorder('top')}
          >
            <BorderTop />
            <div>上边框</div>
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={hasLeftBorder}
            onCheckedChange={getOnSelectTableBorder('left')}
          >
            <BorderLeft />
            <div>左边框</div>
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={hasRightBorder}
            onCheckedChange={getOnSelectTableBorder('right')}
          >
            <BorderRight />
            <div>右边框</div>
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>

        <DropdownMenuGroup>
          <DropdownMenuCheckboxItem
            checked={hasNoBorders}
            onCheckedChange={getOnSelectTableBorder('none')}
          >
            <BorderNone />
            <div>隐藏所有边框</div>
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={hasOuterBorders}
            onCheckedChange={getOnSelectTableBorder('outer')}
          >
            <BorderAll />
            <div>显示所有边框</div>
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    );
  }
);

export const TableFloatingToolbar = withRef<typeof PopoverContent>(
  ({ children, ...props }, ref) => {
    const { editor, tf } = useEditorPlugin(TablePlugin);

    const element = useElement<TTableElement>();
    const { props: buttonProps } = useRemoveNodeButton({ element });

    const selectionCollapsed = useEditorSelector(
      (editor) => !isSelectionExpanded(editor),
      []
    );

    const readOnly = useReadOnly();
    const selected = useSelected();

    const collapsed = !readOnly && selected && selectionCollapsed;
    const open = !readOnly && selected;

    const { canMerge, canUnmerge } = useTableMergeState();

    const tableSelected = useEditorSelector(
      (editor) => someNode(editor, { match: { type: TablePlugin.key } }),
      []
    );

    const tableEntries = getTableEntries(editor);
    const table = tableEntries?.table[0];
    const tablePath = tableEntries?.table[1];
    /**
     * 获取表格是否有标题行
     */
    const hasHeaderRow = (table: any) => {
      return table.children?.[0].children.some(
        (cell: any) => cell.type === 'th' && cell.table_header_row
      );
    };

    /**
     * 获取表格是否有标题列
     */
    const hasHeaderColumn = (table: any) => {
      return table.children?.some(
        (row: any) =>
          row.children[0].type === 'th' && row.children[0].table_header_cell
      );
    };

    const mergeContent = canMerge && (
      <Button
        variant="ghost"
        onClick={() => mergeTableCells(editor)}
        contentEditable={false}
        isMenu
      >
        <Combine />
        合并
      </Button>
    );

    const unmergeButton = canUnmerge && (
      <Button
        variant="ghost"
        onClick={() => unmergeTableCells(editor)}
        contentEditable={false}
        isMenu
      >
        <Ungroup />
        取消合并
      </Button>
    );

    const bordersContent = collapsed && (
      <>
        {/* <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" isMenu>
              <BorderAll />
              边框设置
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuPortal>
            <TableBordersDropdownMenuContent />
          </DropdownMenuPortal>
        </DropdownMenu>
        <Divider /> */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" isMenu>
              <PanelTop />
              标题行列
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuPortal>
            <DropdownMenuContent side="right">
              <DropdownMenuGroup>
                <DropdownMenuCheckboxItem
                  checked={hasHeaderRow(table)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      // 修改表格的第一行（假设路径为 [0, 0]）
                      setNodes<any>(
                        editor,
                        { type: 'th', table_header_row: true },
                        {
                          at: [tablePath?.[0] || 0, 0],
                          match: (node: any) => node.type === 'td', // 可选：确保目标节点是 `td`
                        }
                      );
                    } else {
                      setNodes<any>(
                        editor,
                        { type: 'td', table_header_row: undefined },
                        {
                          at: [tablePath?.[0] || 0, 0],
                          match: (node: any) =>
                            node.type === 'th' && !node.table_header_cell, // 可选：确保目标节点是 `th`
                        }
                      );
                    }
                  }}
                >
                  <PanelTop /> 标题行
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={hasHeaderColumn(table)}
                  onCheckedChange={(checked) => {
                    const columnIndex = 0; // 你想要设置为标题列的列索引
                    const columnPaths = table?.children?.map(
                      (row: any, rowIndex: number) => {
                        return [tablePath, rowIndex, columnIndex];
                      }
                    );

                    if (checked) {
                      columnPaths?.forEach((path: any) => {
                        setNodes<any>(
                          editor,
                          { type: 'th', table_header_cell: true },
                          {
                            at: path,
                            match: (node: any) => node.type === 'td', // 可选：确保目标节点是 `td`
                          }
                        );
                      });
                    } else {
                      columnPaths?.forEach((path: any) => {
                        setNodes<any>(
                          editor,
                          { type: 'td', table_header_cell: undefined },
                          {
                            at: path,
                            match: (node: any) =>
                              node.type === 'th' && !node.table_header_row, // 确保目标节点是 `th` 且不是标题行
                          }
                        );
                      });
                    }
                  }}
                >
                  <PanelLeft />
                  标题列
                </DropdownMenuCheckboxItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenu>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild disabled={!tableSelected}>
            <Button variant="ghost" isMenu>
              <RectangleVertical />
              表格列
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuPortal>
            <DropdownMenuContent side="right">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="min-w-[180px]"
                  disabled={!tableSelected}
                  onSelect={() => {
                    tf.insert.tableColumn();
                    focusEditor(editor);
                  }}
                >
                  <Plus />
                  在后面插入列
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="min-w-[180px]"
                  disabled={!tableSelected}
                  onSelect={() => {
                    deleteColumn(editor);
                    focusEditor(editor);
                  }}
                >
                  <Minus />
                  删除列
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={!tableSelected}>
            <Button variant="ghost" isMenu>
              <RectangleHorizontal />
              表格行
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuPortal>
            <DropdownMenuContent side="right">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="min-w-[180px]"
                  disabled={!tableSelected}
                  onSelect={() => {
                    insertTableRow(editor);
                    focusEditor(editor);
                  }}
                >
                  <Plus />
                  在下面插入行
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="min-w-[180px]"
                  disabled={!tableSelected}
                  onSelect={() => {
                    deleteRow(editor);
                    focusEditor(editor);
                  }}
                >
                  <Minus />
                  删除行
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenu>
        <Divider />
        <Button variant="ghost" contentEditable={false} isMenu {...buttonProps}>
          <Trash2Icon />
          删除
        </Button>
      </>
    );

    return (
      <Popover open={open} modal={false}>
        <PopoverAnchor asChild>{children}</PopoverAnchor>
        {(canMerge || canUnmerge || collapsed) && (
          <PopoverContent
            ref={ref}
            className={cn(popoverVariants(), 'flex w-[220px] flex-col p-1')}
            onOpenAutoFocus={(e) => e.preventDefault()}
            {...props}
          >
            {unmergeButton}
            {mergeContent}
            {bordersContent}
          </PopoverContent>
        )}
      </Popover>
    );
  }
);

export const TableElement = withHOC(
  TableProvider,
  withRef<typeof PlateElement>(({ children, className, ...props }, ref) => {
    const { colSizes, isSelectingCell, marginLeft, minColumnWidth } =
      useTableElementState();
    const { colGroupProps, props: tableProps } = useTableElement();

    return (
      <TableFloatingToolbar>
        <PlateElement
          className={cn('overflow-x-auto', className)}
          style={{ paddingLeft: marginLeft }}
          {...props}
        >
          <table
            ref={ref}
            className={cn(
              'my-4 ml-px mr-0 table h-px w-[calc(100%-6px)] table-fixed border-collapse',
              isSelectingCell && '[&_*::selection]:bg-none'
            )}
            {...tableProps}
          >
            <colgroup {...colGroupProps}>
              {colSizes.map((width, index) => (
                <col
                  key={index}
                  style={{
                    minWidth: minColumnWidth,
                    width: width || undefined,
                  }}
                />
              ))}
            </colgroup>
            <tbody className="min-w-full">{children}</tbody>
          </table>
        </PlateElement>
      </TableFloatingToolbar>
    );
  })
);

const BorderAll = (props: LucideProps) => (
  <svg
    fill="currentColor"
    focusable="false"
    height="48"
    role="img"
    viewBox="0 0 24 24"
    width="48"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6zm10 13h5a1 1 0 0 0 1-1v-5h-6v6zm-2-6H5v5a1 1 0 0 0 1 1h5v-6zm2-2h6V6a1 1 0 0 0-1-1h-5v6zm-2-6H6a1 1 0 0 0-1 1v5h6V5z" />
  </svg>
);

const BorderBottom = (props: LucideProps) => (
  <svg
    fill="currentColor"
    focusable="false"
    height="48"
    role="img"
    viewBox="0 0 24 24"
    width="48"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M13 5a1 1 0 1 0 0-2h-2a1 1 0 1 0 0 2h2zm-8 6a1 1 0 1 0-2 0v2a1 1 0 1 0 2 0v-2zm-2 7a1 1 0 1 1 2 0 1 1 0 0 0 1 1h12a1 1 0 0 0 1-1 1 1 0 1 1 2 0 3 3 0 0 1-3 3H6a3 3 0 0 1-3-3zm17-8a1 1 0 0 0-1 1v2a1 1 0 1 0 2 0v-2a1 1 0 0 0-1-1zM7 4a1 1 0 0 0-1-1 3 3 0 0 0-3 3 1 1 0 0 0 2 0 1 1 0 0 1 1-1 1 1 0 0 0 1-1zm11-1a1 1 0 1 0 0 2 1 1 0 0 1 1 1 1 1 0 1 0 2 0 3 3 0 0 0-3-3z" />
  </svg>
);

const BorderLeft = (props: LucideProps) => (
  <svg
    fill="currentColor"
    focusable="false"
    height="48"
    role="img"
    viewBox="0 0 24 24"
    width="48"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M6 21a1 1 0 1 0 0-2 1 1 0 0 1-1-1V6a1 1 0 0 1 1-1 1 1 0 0 0 0-2 3 3 0 0 0-3 3v12a3 3 0 0 0 3 3zm7-16a1 1 0 1 0 0-2h-2a1 1 0 1 0 0 2h2zm6 6a1 1 0 1 1 2 0v2a1 1 0 1 1-2 0v-2zm-5 9a1 1 0 0 1-1 1h-2a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1zm4-17a1 1 0 1 0 0 2 1 1 0 0 1 1 1 1 1 0 1 0 2 0 3 3 0 0 0-3-3zm-1 17a1 1 0 0 0 1 1 3 3 0 0 0 3-3 1 1 0 1 0-2 0 1 1 0 0 1-1 1 1 1 0 0 0-1 1z" />
  </svg>
);

const BorderNone = (props: LucideProps) => (
  <svg
    fill="currentColor"
    focusable="false"
    height="48"
    role="img"
    viewBox="0 0 24 24"
    width="48"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M14 4a1 1 0 0 1-1 1h-2a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1zm-9 7a1 1 0 1 0-2 0v2a1 1 0 1 0 2 0v-2zm14 0a1 1 0 1 1 2 0v2a1 1 0 1 1-2 0v-2zm-6 10a1 1 0 1 0 0-2h-2a1 1 0 1 0 0 2h2zM7 4a1 1 0 0 0-1-1 3 3 0 0 0-3 3 1 1 0 0 0 2 0 1 1 0 0 1 1-1 1 1 0 0 0 1-1zm11-1a1 1 0 1 0 0 2 1 1 0 0 1 1 1 1 1 0 1 0 2 0 3 3 0 0 0-3-3zM7 20a1 1 0 0 1-1 1 3 3 0 0 1-3-3 1 1 0 1 1 2 0 1 1 0 0 0 1 1 1 1 0 0 1 1 1zm11 1a1 1 0 1 1 0-2 1 1 0 0 0 1-1 1 1 0 1 1 2 0 3 3 0 0 1-3 3z" />
  </svg>
);

const BorderRight = (props: LucideProps) => (
  <svg
    fill="currentColor"
    focusable="false"
    height="48"
    role="img"
    viewBox="0 0 24 24"
    width="48"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M13 5a1 1 0 1 0 0-2h-2a1 1 0 1 0 0 2h2zm-8 6a1 1 0 1 0-2 0v2a1 1 0 1 0 2 0v-2zm9 9a1 1 0 0 1-1 1h-2a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1zM6 3a1 1 0 0 1 0 2 1 1 0 0 0-1 1 1 1 0 0 1-2 0 3 3 0 0 1 3-3zm1 17a1 1 0 0 1-1 1 3 3 0 0 1-3-3 1 1 0 1 1 2 0 1 1 0 0 0 1 1 1 1 0 0 1 1 1zm11 1a1 1 0 1 1 0-2 1 1 0 0 0 1-1V6a1 1 0 0 0-1-1 1 1 0 1 1 0-2 3 3 0 0 1 3 3v12a3 3 0 0 1-3 3z" />
  </svg>
);

const BorderTop = (props: LucideProps) => (
  <svg
    fill="currentColor"
    focusable="false"
    height="48"
    role="img"
    viewBox="0 0 24 24"
    width="48"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M3 6a1 1 0 0 0 2 0 1 1 0 0 1 1-1h12a1 1 0 0 1 1 1 1 1 0 1 0 2 0 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3zm2 5a1 1 0 1 0-2 0v2a1 1 0 1 0 2 0v-2zm14 0a1 1 0 1 1 2 0v2a1 1 0 1 1-2 0v-2zm-5 9a1 1 0 0 1-1 1h-2a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1zm-8 1a1 1 0 1 0 0-2 1 1 0 0 1-1-1 1 1 0 1 0-2 0 3 3 0 0 0 3 3zm11-1a1 1 0 0 0 1 1 3 3 0 0 0 3-3 1 1 0 1 0-2 0 1 1 0 0 1-1 1 1 1 0 0 0-1 1z" />
  </svg>
);
