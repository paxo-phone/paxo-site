// here put the code that you may need in other js files - @Welpike


export async function getData(url) {
    const response = await fetch(url);
    return response.json();
}
