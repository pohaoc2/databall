import altair as alt
import numpy as np
import pandas as pd


def draw_scatter_dropdown(data, x, y, player_names:list['str']=None, init_year:int=2021):
    width = 1000
    height = 400
    baseball_properties = data.columns.tolist()[:8]
    dropdown_df = combine_dataframe_by_properties(data, baseball_properties, x, y)
    text_x = np.unique(dropdown_df['var1'])
    text_y = [text.split(" ")[-1] for text in text_x]
    df_text = pd.DataFrame({'var1': text_x, 'var2': text_y})
    print(df_text)

    dropdown_df.loc[:, "selected"] = dropdown_df["Name"].apply(lambda x: x if x in player_names else "Others")
    domain = [player_names[0], player_names[1], "Others"]
    colors = ['red', 'green', 'gray']

    dropdown_options = dropdown_df['var1'].drop_duplicates().tolist()
    baseball_dropdown_x = alt.binding_select(options=dropdown_options, name="x and y axes for scatter plot")
    selection_x = alt.selection_point(fields=['var1'], bind=baseball_dropdown_x)

    slider = alt.binding_range(min=dropdown_df["Year"].min(), max=dropdown_df["Year"].max(), step=1, name='year:')
    year = alt.selection_point(name="year", fields=['Year'], bind=slider, value=init_year)

    scale_selection = alt.selection_interval(bind='scales')
    text_x = alt.Chart(df_text).mark_text(align='right', dx=int(width/2)-10, dy=int(height/2)-10, size=15).encode(
        text='label:N'
    ).transform_filter(
        selection_x
    ).transform_calculate(label='datum.var2')

    text_y = alt.Chart(df_text).mark_text(dx=-int(width/2)+20, dy=-int(height/2)+10, size=15).encode(
        text='label:N'
    ).transform_filter(
        selection_x
    ).transform_calculate(label='datum.var1[0] + "" + datum.var1[1]')

    scatter_chart = alt.Chart(dropdown_df).mark_circle(size=100).encode(
                            x=alt.X('value_x:Q', title=''),
                            y=alt.Y('value_y:Q', title=''),
                            color=alt.Color('selected',
                                            sort=player_names,
                                            scale=alt.Scale(domain=domain,
                                                            range=colors)
                                            ),
                        ).add_params(
                            selection_x, scale_selection, year
                        ).transform_filter(
                            selection_x
                        ).transform_filter(
                            year
                        )
    scatter_chart = scatter_chart.encode(
            tooltip=[alt.Tooltip("Name:N"),
                     alt.Tooltip("Team:N"),
                     alt.Tooltip("Age:N"),
                     alt.Tooltip("value_x:N", title="x"),
                     alt.Tooltip("value_y:N", title="y")]
        ).properties(
        width=width,
        height=height
)
    reset_button = alt.Chart().mark_text(
        align='left',
        baseline='middle',
        fontSize=12,
        fontWeight='bold',
        text='Reset Zoom'
    ).encode(
        x=alt.value(10),  # X-coordinate of the button
        y=alt.value(10),  # Y-coordinate of the button
        color=alt.condition(scale_selection, alt.value('blue'), alt.value('gray')),  # Highlight the button if zoomed in
        #cursor=alt.value('pointer')  # Change cursor to pointer when hovering over the button
    ).interactive().transform_filter(scale_selection)

    # Combine the chart and the reset button
    final_chart = scatter_chart+text_x+text_y | reset_button
    return final_chart#scatter_chart


def draw_1D_property(data, player_names:list['str'], init_year:int=2021):
    baseball_properties = data.columns.tolist()[:8]
    baseball_dropdown_strings = data.columns.tolist()[8:]
    dropdown_df = data.melt(id_vars=baseball_properties,
                            value_vars=baseball_dropdown_strings,
                            var_name='var1',
                            value_name="value_x")

    dropdown_df.loc[:, "selected"] = dropdown_df["Name"].apply(lambda x: x if x in player_names else "Others")
    domain = [player_names[0], player_names[1], "Others"]
    colors = ['red', 'green', 'gray']

    dropdown_options = dropdown_df['var1'].drop_duplicates().tolist()
    baseball_dropdown_x = alt.binding_select(options=dropdown_options, name="Dropdown option for tick plot")
    selection_x = alt.selection_point(fields=['var1'], bind=baseball_dropdown_x)

    slider = alt.binding_range(min=dropdown_df["Year"].min(), max=dropdown_df["Year"].max(), step=1, name='year:')
    year = alt.selection_point(name="year", fields=['Year'], bind=slider, value=init_year)

    scale_selection = alt.selection_interval(bind='scales')

    scatter_chart = alt.Chart(dropdown_df).mark_tick().encode(
                            x=alt.X('value_x:Q', title=''),
                            color=alt.Color('selected',
                                            sort=player_names,
                                            scale=alt.Scale(domain=domain,
                                                            range=colors)
                                            ),
                        ).add_params(
                            selection_x, scale_selection, year
                        ).transform_filter(
                            selection_x
                        ).transform_filter(
                            year
                        )
    scatter_chart = scatter_chart.encode(
            tooltip=[alt.Tooltip("Name:N"),
                     alt.Tooltip("Team:N"),
                     alt.Tooltip("Age:N"),
                     alt.Tooltip("value_x:N", title="x"),]
        ).properties(
        width=1000)
    return scatter_chart


def combine_dataframe_by_properties(df, id_vars, x:list, y:list):
    """TODO"""
    df1 = df.melt(id_vars=id_vars, value_vars=x,  var_name='var1', value_name="value_x")
    df2 = df.melt(id_vars=id_vars, value_vars=y,  var_name='var2', value_name="value_y")
    df1 = df1.set_index(id_vars+ [df1.groupby(id_vars).cumcount()])
    df2 = df2.set_index(id_vars+ [df2.groupby(id_vars).cumcount()])
    df3 = (pd.concat([df1, df2],axis=1)
            .sort_index(level=8)
            .reset_index(level=8, drop=True)
            .reset_index())
    for x_label, y_label in zip(x, y):
        df3.loc[df3['var1'] == x_label, 'var1'] = f"{x_label} versus {y_label}"
    return df3

def main():
    baseball_data = pd.read_csv("../data/mlb17to22.csv") # master

    x = ['SO', 'BA', 'HR']
    y = ['BB', 'SLG', 'SB']
    player_names = ["Carson Kelly", "Josh Rojas"]
    init_year = 2021
    scatter_chart = draw_scatter_dropdown(baseball_data, x, y, player_names, init_year)
    
    scatter_chart.save("dropdown.html")
    one_d_chart = draw_1D_property(baseball_data, player_names, init_year)
    combine = alt.vconcat(scatter_chart, one_d_chart)
    combine.save("combine.html")

if __name__ == "__main__":
    main()