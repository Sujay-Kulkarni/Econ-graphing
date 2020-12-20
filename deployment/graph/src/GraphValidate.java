import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Map.Entry;

import net.sf.json.*;

public class GraphValidate {
	
	public JSONObject validateGraphData(JSONObject fbData, JSONObject stuInput){
		return validateGraphData(fbData, stuInput, null);
	}
	public JSONObject validateGraphData(JSONObject fbData, JSONObject stuInput, PrintWriter out){

		// The JSONObject response being sent back
		JSONObject response = new JSONObject();
		
		//create correct variable
		Boolean correct = false;
		
		JSONObject graph = stuInput.getJSONObject("graph");
		String answer = graph.getString("tgcorrect");
		String feedback = graph.getString("ckeFeedback");

		//check student input, whether correct or not.
		if((answer.equals("correct")))
		{
			correct = true;
		} else
		{
		    correct = false;
		}	
			
		response.element("result", correct);
		response.element("fbData", feedback);

		return response;
	}

}
