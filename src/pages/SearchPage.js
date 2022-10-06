import { useEffect, useState } from 'react';
import { Button, FormGroup, FormControl, Stack, ListGroup, ListGroupItem, Alert } from 'react-bootstrap';
import { useMutation, useQuery, useQueryClient } from 'react-query'
import api from '../services/api';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const queryClient = useQueryClient();
  const debouncedQuery = useDebounce(query, 1000);

  const { isLoading, isError, data } = useQuery(["search", debouncedQuery], async () => {
    const {data} = await api.get(`/dictionary?q=${debouncedQuery}`)
    return data;
  }, { enabled: Boolean(debouncedQuery) });

  const addWordMutation = useMutation(
    async payload => {
      return await api.post('/dictionary', payload);
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries(["search", query]);
      }
    }
  );

  const removeWordMutation = useMutation(
    async word => {
      return await api.delete(`/dictionary/${word}`);
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries(["search", query]);
      }
    }
  );

  const addWord = (e) => {
    e.preventDefault();
    addWordMutation.mutate({word: query})
  };

  const removeWord = (word) => {
    removeWordMutation.mutate(word)
  };

  return (
    <div>
      <div className='pt-5 pb-5'>
        <h2>Dictionary search and management</h2>
      </div>
      <div className='mx-auto p-5'>
        <form>
          <FormGroup>
            <Stack direction="horizontal" gap={3}>
              <FormControl
                type="text"
                value={query}
                placeholder="Enter word to search"
                onChange={e => setQuery(e.target.value)}
              />
              <Button>Search</Button>
            </Stack>
          </FormGroup>
        </form>
      </div>
      <div className='p-5'>
        {isLoading && <Alert key={'info'} variant={'info'}>Searching...</Alert>}
        {addWordMutation.isFetching && <Alert key={'info'} variant={'info'}>Adding new word...</Alert>}
        {removeWordMutation.isFetching && <Alert key={'info'} variant={'info'}>Removing word...</Alert>}
        {isError && <Alert key={'danger'} variant={'danger'}>Error while searching on dictionary.</Alert>}
        {!isLoading && data && data.length === 0 && (
          <Alert key={'warning'} variant={'warning'}>Word not found, click <Alert.Link onClick={addWord}>here</Alert.Link> add {query} to dictionary.</Alert>
        )}
        {!isLoading && data && (
          <ListGroup>
            {data.map(match => (
              <ListGroupItem>{match}<Button className='mx-4' variant="danger" onClick={() => removeWord(match)}>Delete</Button></ListGroupItem>
            ))}
          </ListGroup>
        )}
      </div>
    </div>
  );
}

const useDebounce = (value, delay) => {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(
    () => {
      // Update debounced value after delay
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      // Cancel the timeout if value changes (also on delay change or unmount)
      // This is how we prevent debounced value from updating if value is changed ...
      // .. within the delay period. Timeout gets cleared and restarted.
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay] // Only re-call effect if value or delay changes
  );
  return debouncedValue;
}

export default SearchPage;