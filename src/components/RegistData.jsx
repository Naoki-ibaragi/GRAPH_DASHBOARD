import { useState,useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  Stack,
  LinearProgress,
} from "@mui/material";
import { open } from "@tauri-apps/plugin-dialog"; // ファイルダイアログ用
import { invoke } from "@tauri-apps/api/core"; //rustバックエンドでの処理用
import { listen } from "@tauri-apps/api/event";

function RegistData() {
    const [filePath, setFilePath] = useState("D:\\testspace\\csv_data"); // DB登録用のテキストデータのパス
    const [typeName,setTypeName] = useState(""); //バックエンドに送る機種名
    const [isProcess,setIsProcess]=useState(false); //バックエンドで処理中かどうか
    const [isError,setIsError]=useState(false); //バックエンドで処理でエラーが発生した場合true
    const [state,setState]=useState("処理開始");  //処理状況
    const [historyList,setHistoryList]=useState([]);

    // コンポーネントマウント時にリスナーを設定
    useEffect(() => {
        let unlistenProgress;
        let unlistenComplete;

        const setupListeners = async () => {
            // 進捗イベントのリスナー
            unlistenProgress = await listen('regist_data-progress', (event) => {
                const payload = event.payload;
                console.log(`進捗: ${payload.progress}% - ${payload.message}`);
                setState(`${payload.message}`);
            });
            
            // 完了イベントのリスナー
            unlistenComplete = await listen('regist_data-complete', (event) => {
                const payload = event.payload;
                
                if (payload.success) {
                    console.log('処理成功:', payload.data);
                    setIsProcess(false);
                    setHistoryList((prev) => [
                        ...prev,
                        { file_path: payload.data.file_path, result: true },
                    ]);
                } else {
                    console.error('処理失敗:', payload.error);
                    setIsError(true);
                    setIsProcess(false);
                    setHistoryList((prev) => [
                        ...prev,
                        { file_path: payload.data.file_path, result: false },
                    ]);
                }
            });
        };

        setupListeners();

        // クリーンアップ
        return () => {
            if (unlistenProgress) unlistenProgress();
            if (unlistenComplete) unlistenComplete();
        };
    }, []);

    //ファイルパスをダイアログから選択
    const selectFilePath = async () => {
        const selected = await open({
        directory: false,   // フォルダ選択モード
        multiple: false,   // 複数選択しない
        });

        if (selected) {
            setFilePath(selected); // 選択されたフォルダパスを state に反映
        }
    };

    // バックエンドにフォルダパスを送って登録処理を走らせる
    const registData = async () => {
        setIsError(false); //処理開始前にエラーをリセットする
        setIsProcess(true);  //処理フラグを立てて進捗を表示する
        try {
            // バックエンドのコマンドを呼び出し（即座に戻る）
            await invoke('regist_data', { filePath:filePath,typeName:typeName });
            setIsError(false);
        } catch (error) {
            console.error('コマンド呼び出しエラー:', error);
            setIsError(true);
            setHistoryList((prev) => [
                ...prev,
                { file_path: filePath, result: false },
            ]);
            unlistenProgress();
            unlistenComplete();
        }
    };

    return (
        <Box>
        <Card>
            <CardContent>
            <Typography variant="h6" gutterBottom>
                ロット情報のDBへの登録
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
                テキストデータのフォルダパスの入力
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <TextField
                size="small"
                label="フォルダパス"
                sx={{
                    width: 500,
                }}
                value={filePath}
                onChange={(e) => setFilePath(e.target.value)}
                />
                <Button
                variant="contained"
                color="primary"
                onClick={selectFilePath}
                >
                ファイル選択
                </Button>
            </Stack>
            <Typography variant="body2" color="text.secondary" mb={2}>
                機種名の入力
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <TextField
                size="small"
                label="機種名"
                sx={{
                    width: 500,
                }}
                value={typeName}
                onChange={(e) => setTypeName(e.target.value)}
                />
            </Stack>
            <Button
                variant="contained"
                color="primary"
                disabled={!filePath}
                onClick={registData}
            >
                DBへデータを登録
            </Button>
            </CardContent>
        </Card>
        {/*処理状況の表示*/}
        {isProcess || isError ?          
        <Card>
            <CardContent>
                <Typography variant="caption" gutterBottom>
                {`処理状況 - ${state}`}
                </Typography>
                <LinearProgress />
            </CardContent>
        </Card>
        :null}
        <Card> {/*処理履歴を最後部に表示する*/}
            <CardContent>
                <Typography gutterBottom>処理履歴</Typography>
                <Stack direction="column" spacing={1}>
                {historyList.map((h, index) => (
                    <Box key={index}>
                    <Typography variant="body2">
                        {h.file_path} - {h.result ? "成功" : "失敗"}
                    </Typography>
                    </Box>
                ))}
                </Stack>
            </CardContent>
        </Card>
        </Box>
    );
}

export default RegistData;
