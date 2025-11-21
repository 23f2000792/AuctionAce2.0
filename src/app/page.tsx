"use client";

import { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { AppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Upload, List } from "lucide-react";
import { shuffleArray } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

export default function Home() {
  const [rawText, setRawText] = useState("");
  const { players, setPlayers, setShuffledPlayers } = useContext(AppContext);
  const router = useRouter();

  const handleTextChange = (text: string) => {
    setRawText(text);
    const names = text.split("\n")
      .map(name => name.trim())
      .filter(name => name.length > 0);
    const uniqueNames = [...new Set(names)];
    setPlayers(uniqueNames);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        handleTextChange(text);
      };
      reader.readAsText(file);
    }
  };

  const removePlayer = (playerToRemove: string) => {
    const newPlayers = players.filter(p => p !== playerToRemove);
    setPlayers(newPlayers);
    const newRawText = newPlayers.join("\n");
    setRawText(newRawText);
  };

  const generateOrder = () => {
    if (players.length > 0) {
      const shuffled = shuffleArray(players);
      setShuffledPlayers(shuffled);
      router.push("/preview");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Player Input</CardTitle>
          <CardDescription>
            Add player names to generate a random auction order. Duplicates and empty lines will be removed.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-8">
          <div>
            <Tabs defaultValue="paste" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="paste"><List className="mr-2" />Paste List</TabsTrigger>
                <TabsTrigger value="upload"><Upload className="mr-2" />Upload File</TabsTrigger>
              </TabsList>
              <TabsContent value="paste">
                <Label htmlFor="player-list" className="sr-only">Paste Player List</Label>
                <Textarea
                  id="player-list"
                  placeholder="Paste player names, one per line..."
                  className="min-h-[200px] mt-4"
                  value={rawText}
                  onChange={(e) => handleTextChange(e.target.value)}
                />
              </TabsContent>
               <TabsContent value="upload">
                <div className="mt-4 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8 text-center">
                    <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
                    <Label htmlFor="file-upload" className="cursor-pointer text-primary hover:underline font-medium">
                      Click to upload a .txt or .csv file
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">One player name per line</p>
                    <Input id="file-upload" type="file" className="sr-only" accept=".txt,.csv" onChange={handleFileChange} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="flex flex-col">
            <h3 className="font-semibold text-lg mb-2">Player Preview ({players.length})</h3>
            <ScrollArea className="flex-grow border rounded-md h-[240px] md:h-auto">
              <div className="p-4">
                {players.length === 0 ? (
                  <p className="text-muted-foreground text-center py-10">Players will appear here...</p>
                ) : (
                  <ul className="space-y-2">
                    {players.map((player) => (
                      <li key={player} className="flex items-center justify-between bg-secondary p-2 rounded-md animate-in fade-in duration-300">
                        <span className="font-medium">{player}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removePlayer(player)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={generateOrder} disabled={players.length < 2} className="w-full sm:w-auto ml-auto bg-accent hover:bg-accent/90">
            Generate Random Order
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
