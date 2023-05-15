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
        thumbnail={items[rubric.source.index].thumbnail}
        channel={items[rubric.source.index].channel}
        position={items[rubric.source.index].position}
        playlistId={items[rubric.source.index].playlistId}
        isDragging={snapshot.isDragging}
      />
    );

type RowProps = {
  data: {
    playlist: Playlist;
    handlePlaylistAt: (newPlaylist: Playlist, index: number) => void;
  };
  index: number;
  style: Object;
};

const Row = React.memo(({ data: { playlist, handlePlaylistAt }, index, style }: RowProps) => {
  const playlistItem = playlist.items[index];
  const renderItem = getRenderItem(playlist.items);

  return (
    <Box sx={style} key={index + playlistItem.id} onClick={() => handlePlaylistAt(playlist, index)}>
      <Draggable draggableId={index + playlistItem.id} index={index} key={index + playlistItem.id}>
        {renderItem}
      </Draggable>
    </Box>
  );
}, areEqual);

type ListProps = {
  playlist: Playlist;
  index: number;
  handlePlaylist: (newPlaylist?: Playlist, fn?: () => void) => void;
  handlePlaylistAt: (newPlaylist: Playlist, index: number) => void;
};

export default function List(props: ListProps) {
  const { playlist, index, handlePlaylist, handlePlaylistAt } = props;
  const renderItem = getRenderItem(playlist.items);

  return (
    <Card variant="outlined" sx={{ minHeight: '17rem', maxHeight: '100%', width: '25%' }}>
      <CardContent sx={{ p: 1, height: '100%' }}>
        <MuiList
          subheader={
            <ListSubheader
              onClick={() => handlePlaylist(playlist)}
              sx={{ borderBottom: 'solid 1px rgba(255, 255, 255, 0.12)' }}
            >
              {playlist.title}
            </ListSubheader>
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
                    itemSize={48.48}
                    width={width}
                    outerRef={provided.innerRef}
                    itemData={{ playlist, handlePlaylistAt }}
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
