import React from 'react';
import { Box, List as MuiList, Card, CardContent, ListSubheader } from '@mui/material';
import {
  Droppable,
  Draggable,
  type DraggableProvided,
  type DraggableStateSnapshot,
  type DraggableRubric,
} from 'react-beautiful-dnd';
import { FixedSizeList, areEqual } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import Item from './Item';
import { Playlist, PlaylistItem } from './Dashboard';

const getRenderItem =
  (items: PlaylistItem[]) => (provided: DraggableProvided, snapshot: DraggableStateSnapshot, rubric: DraggableRubric) =>
    (
      <Item
        innerRef={provided.innerRef}
        provided={provided}
        name={items[rubric.source.index].title}
        isDragging={snapshot.isDragging}
      />
    );

interface RowProps {
  data: Playlist;
  index: number;
  style: Object;
}

const Row = React.memo(({ data: playlist, index, style }: RowProps) => {
  const playlistItem = playlist.items[index];
  const renderItem = getRenderItem(playlist.items);

  return (
    <Box sx={style} key={index + playlistItem.id}>
      <Draggable draggableId={index + playlistItem.id} index={index} key={index + playlistItem.id}>
        {renderItem}
      </Draggable>
    </Box>
  );
}, areEqual);

export default function List(props: any) {
  const playlist: Playlist = props.playlist;
  const index: number = props.index;

  const renderItem = getRenderItem(playlist.items);

  return (
    <Card variant="outlined" sx={{ height: '100%', width: 200 }}>
      <CardContent sx={{ p: 1, height: '100%' }}>
        <MuiList
          subheader={
            <ListSubheader sx={{ borderBottom: 'solid 1px rgba(255, 255, 255, 0.12)' }}>{playlist.title}</ListSubheader>
          }
          sx={{ height: '100%' }}
        >
          <Droppable droppableId={index.toString()} renderClone={renderItem} mode="virtual">
            {(provided) => (
              <AutoSizer>
                {({ height, width }) => (
                  <FixedSizeList
                    height={height}
                    itemCount={playlist.items.length}
                    itemSize={48}
                    width={width}
                    outerRef={provided.innerRef}
                    itemData={playlist}
                  >
                    {Row}
                  </FixedSizeList>
                )}
              </AutoSizer>
            )}
          </Droppable>
        </MuiList>
      </CardContent>
    </Card>
  );
}
