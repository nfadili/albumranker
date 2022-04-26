import { useCallback, useRef, useState } from 'react';
import type { Column } from 'react-table';
import { useTable, Row } from 'react-table';
import debounce from 'lodash.debounce';
import type { DropTargetMonitor } from 'react-dnd';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import update from 'immutability-helper';
import { Table } from '@mantine/core';
import type { UserSpotifyAlbum } from '~/spotify/client.server';

const DND_ITEM_TYPE = 'row';

interface IProps {
    columns: readonly Column[];
    data: UserSpotifyAlbum[];
    onChange: (albums: UserSpotifyAlbum[]) => void;
}

export function AlbumTable({ columns, data, onChange }: IProps) {
    const [records, setRecords] = useState(data);

    const getRowId = useCallback((row) => {
        return row.spotifyId;
    }, []);

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
        data: records as {}[],
        columns,
        getRowId
    });

    const moveRow = (dragIndex: number, hoverIndex: number) => {
        const dragRecord = records[dragIndex];
        const updatedRecords = update(records, {
            $splice: [
                [dragIndex, 1],
                [hoverIndex, 0, dragRecord]
            ]
        });
        setRecords(updatedRecords);
        onChange(updatedRecords);
    };

    return (
        <div>
            <DndProvider backend={HTML5Backend}>
                <Table {...getTableProps()}>
                    <thead>
                        {headerGroups.map((headerGroup) => (
                            <tr {...headerGroup.getHeaderGroupProps()}>
                                <th></th>
                                {headerGroup.headers.map((column) => (
                                    <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody {...getTableBodyProps()}>
                        {rows.map((row, index) => {
                            prepareRow(row);
                            return (
                                <AlbumRow
                                    index={index}
                                    row={row}
                                    moveRow={moveRow}
                                    {...row.getRowProps()}
                                />
                            );
                        })}
                    </tbody>
                </Table>
            </DndProvider>
        </div>
    );
}

const AlbumRow = ({
    row,
    index,
    moveRow
}: {
    row: Row;
    index: number;
    moveRow: (dragIndex: number, hoverIndex: number) => void;
}) => {
    const dropRef = useRef<HTMLTableRowElement>(null);
    const dragRef = useRef<HTMLTableDataCellElement>(null);

    const [, drop] = useDrop({
        accept: DND_ITEM_TYPE,
        hover: debounce((item: Row, monitor: DropTargetMonitor) => {
            if (!dropRef.current) {
                return;
            }
            const dragIndex = item.index;
            const hoverIndex = index;
            // Don't replace items with themselves
            if (dragIndex === hoverIndex) {
                return;
            }
            // Determine rectangle on screen
            const hoverBoundingRect = dropRef.current.getBoundingClientRect();
            // Get vertical middle
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            // Determine mouse position
            const clientOffset = monitor.getClientOffset();
            if (clientOffset === null) {
                return;
            }
            // Get pixels to the top
            const hoverClientY = clientOffset.y - hoverBoundingRect.top;
            // Only perform the move when the mouse has crossed half of the items height
            // When dragging downwards, only move when the cursor is below 50%
            // When dragging upwards, only move when the cursor is above 50%
            // Dragging downwards
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                return;
            }
            // Dragging upwards
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                return;
            }
            // Time to actually perform the action
            moveRow(dragIndex, hoverIndex);
            // Note: we're mutating the monitor item here!
            // Generally it's better to avoid mutations,
            // but it's good here for the sake of performance
            // to avoid expensive index searches.
            item.index = hoverIndex;
        }, 1) // TODO: Might need to mess with this a bit more to fine tune it
    });

    const [{ isDragging }, drag, preview] = useDrag({
        type: DND_ITEM_TYPE,
        item: { type: DND_ITEM_TYPE, index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging()
        })
    });

    const opacity = isDragging ? 0 : 1;

    preview(drop(dropRef));
    drag(dragRef);

    return (
        <tr ref={dropRef} style={{ opacity }}>
            <td ref={dragRef}>
                <i aria-hidden />
            </td>
            {row.cells.map((cell) => {
                return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
            })}
        </tr>
    );
};
